import { Service } from "honestjs";
import type { Context } from "hono";
import type { User } from "better-auth";
import { v4 as uuidV4 } from "uuid";
import { and, eq } from "drizzle-orm";

import { streamText } from "hono/streaming";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { google } from "@packages/llm/models/google";

import { db } from "@/db";
import { chats } from "@/db/schema/chat";
import { retrieveRelevantChunks } from "@/tool/retrieveRelevantChunks";

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

      // Get conversation history for context
      let conversationHistory = "";
      if (existingMessages.length > 0) {
        const previousMessages = await db.query.messages.findMany({
          where: (messages, { eq }) => eq(messages.chatId, chatId.id),
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });

        conversationHistory = previousMessages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");
      }

      // Parse document mentions and fetch their content
      const mentionedDocs = await this.parseDocumentMentions(
        body.msg ?? "",
        user.id,
      );

      // Get context based on mentioned documents or semantic search
      let context = "";

      if (mentionedDocs.length > 0) {
        // Get content from mentioned documents only
        const mentionedDocIds = mentionedDocs.map((doc) => doc.id);
        const contextChunks = await retrieveRelevantChunks(
          body.msg ?? "",
          user.id,
          5,
          mentionedDocIds,
        );

        const docContext = mentionedDocs
          .map(
            (doc) =>
              `Document: ${doc.name}\nType: ${doc.type}\nURL: ${doc.url}\n---`,
          )
          .join("\n\n");

        context += `Mentioned Documents:\n${docContext}\n\n`;

        if (contextChunks.length > 0) {
          context += `Document Content:\n${contextChunks.join("\n\n")}`;
        }
      } else {
        // No documents mentioned, use semantic search across all documents
        const contextChunks = await retrieveRelevantChunks(
          body.msg ?? "",
          user.id,
          5,
        );

        if (contextChunks.length > 0) {
          context += `Relevant Context:\n${contextChunks.join("\n\n")}`;
        }
      }

      console.log("[DEBUG] Final context:", `${context.substring(0, 200)}...`);

      try {
        const stream = await this.runLLMStream(
          body.msg ?? "",
          context,
          conversationHistory,
        );

        let response = "";

        return streamText(c, async (writer) => {
          try {
            for await (const chunk of stream) {
              response += chunk;
              await writer.write(chunk);
            }

            await writer.write(`[CHAT_SLUG]:${finalSlug}`);
            await writer.close();

            await this.messageService.createMessage(
              chatId.id,
              "assistant",
              response,
            );
          } catch (streamError) {
            console.error("[ERROR] Stream processing failed:", streamError);
            await writer.write(
              "Sorry, there was an error processing your request. Please try again.",
            );
            await writer.close();
          }
        });
      } catch (error) {
        console.error("[ERROR] Failed to create stream:", error);
        return c.json(
          {
            success: false,
            message: "Failed to process chat request",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    } catch (error) {
      console.log({ error });
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
    // Extract document mentions like @filename.pdf
    const mentionRegex = /@([^\s]+)/g;
    const mentions = message.match(mentionRegex);

    if (!mentions) return [];

    const documentNames = mentions.map((mention) => mention.slice(1)); // Remove @ symbol
    console.log("[DEBUG] Found document mentions:", documentNames);

    // Fetch mentioned documents from database
    const mentionedDocs = await db.query.resources.findMany({
      where: (resources, { eq, and, inArray }) =>
        and(
          eq(resources.userId, userId),
          inArray(resources.name, documentNames),
        ),
    });

    console.log(
      "[DEBUG] Found mentioned documents:",
      mentionedDocs.map((d) => d.name),
    );
    return mentionedDocs;
  }

  async runLLMStream(input: string, context: string, conversationHistory = "") {
    const systemMessage = conversationHistory
      ? "You are a helpful AI assistant. Use the provided context and conversation history to answer the user's question. When documents are mentioned, use their information to provide accurate answers. Maintain context from the previous conversation."
      : "You are a helpful AI assistant. Use the provided context to answer the user's question. When documents are mentioned, use their information to provide accurate answers.";

    const userMessage = conversationHistory
      ? "Context:\n{context}\n\nConversation History:\n{conversationHistory}\n\nCurrent Question:\n{input}"
      : "Context:\n{context}\n\nQuestion:\n{input}";

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      ["user", userMessage],
    ]);

    const chain = RunnableSequence.from([
      prompt,
      google,
      new StringOutputParser(),
    ]);

    return await chain.stream({ input, context, conversationHistory });
  }
}
