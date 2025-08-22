import { Service } from "honestjs";
import type { Context } from "hono";
import type { User } from "better-auth";
import { v4 as uuidV4 } from "uuid";
import { and, eq } from "drizzle-orm";

import { streamText } from "hono/streaming";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { google } from "@packages/llm/models/google";
import { createSemanticSupervisedAgent } from "@/lib/agent";

import { db } from "@/db";
import { chats } from "@/db/schema/chat";
import { retrieveRelevantChunks } from "@/tool/research/retrieveRelevantChunks";

import type { NewChatDto } from "./dto/new-chat";

import MessageService from "./messages/messages.service";

@Service()
export default class ChatService {
  private messageService = new MessageService();

  async getAllChats(user: User) {
    const chats = await db.query.chats.findMany({
      where: (chats, { eq }) => eq(chats.userId, user.id),
    });

    return {
      success: true,
      data: chats,
    };
  }

  async getSingleChat(chatSlug: string, user: User) {
    const chat = await db.query.chats.findFirst({
      where: (chats, { eq, and }) =>
        and(eq(chats.slug, chatSlug), eq(chats.userId, user.id)),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
      },
    });

    if (!chat) {
      return { success: false, message: "Chat not found" };
    }

    return {
      success: true,
      data: chat,
    };
  }

  async deleteChat(chatId: string, user: User) {
    try {
      const deleted = await db
        .delete(chats)
        .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)))
        .returning();

      const success = deleted.length > 0;

      return {
        success,
        data: deleted,
        message: success
          ? "Chat deleted successfully."
          : "Chat not found or unauthorized.",
      };
    } catch (error) {
      console.log({ error });
    }
  }

  async newChat(c: Context, body: NewChatDto, user: User) {
    try {
      let chatId: { id: string };
      let finalSlug: string;

      // 🧠 Create or find chat
      if (body.slug) {
        // Try to find existing chat first
        const existingChat = await db.query.chats.findFirst({
          where: (chats, { eq, and }) =>
            and(eq(chats.slug, body.slug as string), eq(chats.userId, user.id)),
        });

        if (existingChat) {
          // Continue existing conversation
          chatId = { id: existingChat.id };
          finalSlug = existingChat.slug;
          console.log(
            "[DEBUG] Continuing existing chat:",
            existingChat.id,
            "Slug:",
            finalSlug,
          );
        } else {
          // Chat doesn't exist, create it
          finalSlug = body.slug;
          const newChat = await this.createChat(
            body.msg?.slice(0, 50) ?? "new chat",
            finalSlug,
            user.id,
          );
          chatId = { id: newChat.id };
          console.log(
            "[DEBUG] Created new chat with provided slug:",
            newChat.id,
            "Slug:",
            finalSlug,
          );
        }
      } else {
        // Create new chat with generated slug
        finalSlug = this.generateSlug(body.msg ?? "new-chat");
        const newChat = await this.createChat(
          body.msg?.slice(0, 50) ?? "new chat",
          finalSlug,
          user.id,
        );
        chatId = { id: newChat.id };
        console.log(
          "[DEBUG] Created new chat:",
          newChat.id,
          "Slug:",
          finalSlug,
        );
      }

      // Check if this is a new conversation by looking for existing messages
      const existingMessages = await db.query.messages.findMany({
        where: (messages, { eq }) => eq(messages.chatId, chatId.id),
        limit: 1,
      });

      // 💬 Save user message
      await this.messageService.createMessage(chatId.id, "user", body.msg);
      console.log("[DEBUG] Saved user message for chat:", chatId.id);

      // 📄 Parse document mentions and fetch their content
      const mentionedDocs = await this.parseDocumentMentions(
        body.msg ?? "",
        user.id,
      );

      // 🎯 Create semantic supervisor agent with userId context
      const supervisorAgent = createSemanticSupervisedAgent(false);
      console.log("[DEBUG] Starting supervisor agent stream...");

      // For existing conversations, let LangGraph memory handle context
      // For new conversations, add system message
      const agentMessages: any[] = [];
      
      if (existingMessages.length === 0) {
        // This is a new conversation, add system message
        let systemContent = `You are an intelligent AI assistant that provides helpful, accurate responses.

🎯 **YOUR ROLE**:
• Understand user queries and provide clear, well-structured answers
• Use available capabilities when appropriate to enhance your responses
• Combine information from multiple sources when needed
• Be direct, helpful, and conversational

The right tools for each query will be made available to you seamlessly.`;

        // Add document context if documents are mentioned
        if (mentionedDocs.length > 0) {
          const docNames = mentionedDocs.map(doc => doc.name).join(', ');
          systemContent += `\n\n📄 **Referenced Documents**: ${docNames}`;
        }

        systemContent += `\n\nProvide helpful responses based on the user's needs.`;

        agentMessages.push(new SystemMessage(systemContent));
      }

      // Add user message (replace @resource_id mentions with [DOC_ID:resource_id] format)
      let userMessage = body.msg ?? "";
      
      // Replace @resource_id mentions with [DOC_ID:resource_id] format
      if (mentionedDocs.length > 0) {
        for (const doc of mentionedDocs) {
          const mentionPattern = new RegExp(`@${doc.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
          userMessage = userMessage.replace(mentionPattern, `[DOC_ID:${doc.id}]`);
        }
      }
      
      agentMessages.push(new HumanMessage(userMessage));

      // Get existing messages for context
      if (existingMessages.length > 0) {
        const previousMessages = await db.query.messages.findMany({
          where: (messages, { eq }) => eq(messages.chatId, chatId.id),
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });

        // Convert database messages to LangChain messages
        for (const msg of previousMessages) {
          if (msg.role === "user") {
            agentMessages.push(new HumanMessage(msg.content));
          } else if (msg.role === "assistant") {
            agentMessages.push(new HumanMessage(msg.content));
          }
        }
      }

      return streamText(c, async (stream) => {
        try {
          console.log("[DEBUG] Starting supervisor agent invocation...");
          
          // 🎯 Use supervisor agent with userId context
          const result = await supervisorAgent(agentMessages, {
            configurable: { userId: user.id }
          });

          console.log("[DEBUG] Supervisor agent completed");

          // Save the final response
          const finalResponse = result.messages[result.messages.length - 1];
          if (finalResponse && finalResponse.content) {
            const responseContent = typeof finalResponse.content === 'string' 
              ? finalResponse.content 
              : '';

            await this.messageService.createMessage(
              chatId.id,
              "assistant",
              responseContent,
            );
          }

          // Send the final response
          const responseContent = result.messages[result.messages.length - 1]?.content;
          // console.log("[DEBUG] Response content:", responseContent);
          if (responseContent) {
            const content = typeof responseContent === 'string' 
              ? responseContent 
              : '';

            await stream.write(content);
            await stream.write(`[CHAT_SLUG]:${finalSlug}`);
            await stream.close();
          }

        } catch (error) {
          console.error("[ERROR] Supervisor agent error:", error);
          
          // Save error message
          await this.messageService.createMessage(
            chatId.id,
            "assistant",
            `I apologize, but I encountered an error while processing your request. Please try again.`,
          );

          await stream.write(
            `I apologize, but I encountered an error while processing your request. Please try again.`
          );
          await stream.write(`[CHAT_SLUG]:${finalSlug}`);
          await stream.close();
        }
      });

      } catch (error) {
      console.error("[ERROR] Chat route error:", error);
      return c.json({
            success: false,
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error",
      }, 500);
    }
  }

  generateSlug(input: string): string {
    const rawSlug = input.slice(0, 30).toLowerCase() ?? "new-chat";
    const sanitizedSlug = rawSlug
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `${sanitizedSlug}-${uuidV4()}`;
  }

  async createChat(title: string, slug: string, userId: string) {
    const chat = await db
      .insert(chats)
      .values({
        title: title,
        slug: slug,
        userId: userId,
      })
      .returning();
    return chat[0];
  }

  async parseDocumentMentions(message: string, userId: string) {
    // Extract document mentions like @resource_id
    const mentionRegex = /@([^\s]+)/g;
    const mentions = message.match(mentionRegex);

    if (!mentions) return [];

    const resourceIds = mentions.map((mention) => mention.slice(1)); // Remove @ symbol
    console.log("[DEBUG] Found resource ID mentions:", resourceIds);

    // Fetch mentioned documents from database by ID
    const mentionedDocs = await db.query.resources.findMany({
      where: (resources, { eq, and, inArray }) =>
        and(
          eq(resources.userId, userId),
          inArray(resources.id, resourceIds),
        ),
    });

    console.log(
      "[DEBUG] Found mentioned documents:",
      mentionedDocs,
    );
    return mentionedDocs;
  }
}
