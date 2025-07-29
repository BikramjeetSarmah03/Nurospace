import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";
import {
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { createSupervisorAgent } from "@/lib/supervisor-agent";
import { chats, messages } from "@/db/schema/chat";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { isAuthenticated } from "@/middleware/auth";
import { checkRateLimit, getRateLimitInfo } from "@/lib/utils";

const NewChatSchema = z.object({
  message: z.string(),
  model: z.string().optional(),
  slug: z.string().optional(),
});

export const chatRoutes = new Hono()
  .get("/", isAuthenticated, async (c) => {
    try {
      const userId = c.get("user")?.id;
      if (!userId) throw new Error("Unauthorized");

      // Get all chats for the user
      const userChats = await db
        .select({
          id: chats.id,
          title: chats.title,
          slug: chats.slug,
          createdAt: chats.createdAt,
        })
        .from(chats)
        .where(sql`user_id = ${userId}`)
        .orderBy(sql`created_at DESC`);

      return c.json({
        success: true,
        chats: userChats,
      });
    } catch (error) {
      console.error("[ERROR] Failed to fetch chats:", error);
      return c.json({
        success: false,
        error: "Failed to fetch chats",
      }, 500);
    }
  })
  .get("/:slug", isAuthenticated, async (c) => {
    try {
      const userId = c.get("user")?.id;
      const slug = c.req.param("slug");
      
      if (!userId) throw new Error("Unauthorized");
      if (!slug) throw new Error("Chat slug required");

      // Get the specific chat
      const [chat] = await db
        .select({
          id: chats.id,
          title: chats.title,
          slug: chats.slug,
          createdAt: chats.createdAt,
        })
        .from(chats)
        .where(sql`slug = ${slug} AND user_id = ${userId}`)
        .limit(1);

      if (!chat) {
        return c.json({
          success: false,
          error: "Chat not found",
        }, 404);
      }

      // Get all messages for this chat
      const chatMessages = await db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(sql`chat_id = ${chat.id}`)
        .orderBy(sql`created_at ASC`);

      return c.json({
        success: true,
        chat,
        messages: chatMessages,
      });
    } catch (error) {
      console.error("[ERROR] Failed to fetch chat:", error);
      return c.json({
        success: false,
        error: "Failed to fetch chat",
      }, 500);
    }
  })
  .post(
  "/",
  isAuthenticated,
  zValidator("json", NewChatSchema),
  async (c) => {
    try {
      const { message, slug } = c.req.valid("json");
      const userId = c.get("user")?.id;
      console.log("[DEBUG] User ID:", userId);
      if (!userId) throw new Error("Unauthorized");

      // Check rate limit
      if (!checkRateLimit(userId, 10, 60000)) {
        // 10 requests per minute
        const rateLimitInfo = getRateLimitInfo(userId);
        return c.json(
          {
            success: false,
            error: "Rate limit exceeded",
            message:
              "Too many requests. Please wait a moment before trying again.",
            rateLimitInfo,
          },
          429,
        );
      }

      let chatId: { id: string };
      let finalSlug = slug;

      // 🧠 Create or find chat
      if (!slug) {
        finalSlug = message.toLowerCase().slice(0, 10).replaceAll(" ", "-");
        const [data] = await db
          .insert(chats)
          .values({ userId, title: message.slice(0, 50), slug: finalSlug })
          .returning({ id: chats.id });
        chatId = data;
        console.log("[DEBUG] Created new chat:", chatId, "Slug:", finalSlug);
      } else {
        // Try to find existing chat first
        let [data] = await db
          .select({ id: chats.id })
          .from(chats)
          .where(sql`slug = ${slug} AND user_id = ${userId}`)
          .limit(1);
        
        if (!data) {
          // Chat doesn't exist, create it
          finalSlug = slug;
          [data] = await db
            .insert(chats)
            .values({ userId, title: message.slice(0, 50), slug: finalSlug })
            .returning({ id: chats.id });
          console.log("[DEBUG] Created new chat with provided slug:", data, "Slug:", finalSlug);
        } else {
          console.log("[DEBUG] Found existing chat:", data, "Slug:", slug);
        }
        chatId = data;
      }

      // Check if this is a new conversation by looking for existing messages
      const existingMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(sql`chat_id = ${chatId.id}`)
        .limit(1);
      
      // 💬 Save user message
      await db.insert(messages).values({
        chatId: chatId.id,
        role: "user",
        content: message,
      });
      console.log("[DEBUG] Saved user message fora chat:", chatId.id);

      // 🎯 Create supervisor agent with userId context
      const supervisorAgent = createSupervisorAgent();
      console.log("[DEBUG] Starting supervisor agent stream...");

      // For existing conversations, let LangGraph memory handle context
      // For new conversations, add system message
      const agentMessages: BaseMessage[] = [];
      
      if (existingMessages.length === 0) {
        // This is a new conversation, add system message
        agentMessages.push(
          new SystemMessage(
            `You are a supervisor agent that routes tasks to specialized agents.

🎯 AVAILABLE AGENTS:
• Research Agent: For searching, gathering information, web searches, document retrieval
• Analysis Agent: For data analysis, calculations, reasoning, problem-solving  
• Execution Agent: For taking actions, API calls, tool execution
• Planning Agent: For creating plans, strategies, step-by-step thinking

🧠 INTELLIGENT ROUTING:
• "Find information about..." → Research Agent
• "Calculate..." → Analysis Agent
• "Execute..." → Execution Agent  
• "Plan..." → Planning Agent
• "Tell me about..." → Research Agent
• "How to..." → Planning Agent

📋 SPECIALIZED TOOLS:
• Document Analysis: retrieveRelevantChunks for user's uploaded documents
• Web Search: tavilySearch for current information and news
• Weather Data: getCurrentWeather for weather information
• Time/Date: getCurrentDateTime for current time and date

🎯 RESPONSE FORMAT:
Always respond with ONLY the agent name (research, analysis, execution, or planning) based on the user's request.`
          )
        );
      }

      // Add user message
      agentMessages.push(new HumanMessage(message));

      // Get existing messages for context
      if (existingMessages.length > 0) {
        const previousMessages = await db
          .select({
            role: messages.role,
            content: messages.content,
          })
          .from(messages)
          .where(sql`chat_id = ${chatId.id}`)
          .orderBy(sql`created_at ASC`);

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
            configurable: { userId }
          });

          console.log("[DEBUG] Supervisor agent completed");

          // Save the final response
          const finalResponse = result.messages[result.messages.length - 1];
          if (finalResponse && finalResponse.content) {
            const responseContent = typeof finalResponse.content === 'string' 
              ? finalResponse.content 
              : '';

            await db.insert(messages).values({
              chatId: chatId.id,
              role: "assistant",
              content: responseContent,
            });
          }

          // Send the final response
          const responseContent = result.messages[result.messages.length - 1]?.content;
          if (responseContent) {
            const content = typeof responseContent === 'string' 
              ? responseContent 
              : '';

            await stream.write(content);
          }

        } catch (error) {
          console.error("[ERROR] Supervisor agent error:", error);
          
          // Save error message
          await db.insert(messages).values({
            chatId: chatId.id,
            role: "assistant",
            content: `I apologize, but I encountered an error while processing your request. Please try again.`,
          });

          await stream.write(
            `I apologize, but I encountered an error while processing your request. Please try again.`
          );
        }
      });

    } catch (error) {
      console.error("[ERROR] Chat route error:", error);
      return c.json({
        success: false,
        error: "Failed to process chat message",
      }, 500);
    }
  })
  .delete("/:slug", isAuthenticated, async (c) => {
    try {
      const userId = c.get("user")?.id;
      const slug = c.req.param("slug");
      
      if (!userId) throw new Error("Unauthorized");
      if (!slug) throw new Error("Chat slug required");

      // Get the chat to verify ownership
      const [chat] = await db
        .select({ id: chats.id })
        .from(chats)
        .where(sql`slug = ${slug} AND user_id = ${userId}`)
        .limit(1);

      if (!chat) {
        return c.json({
          success: false,
          error: "Chat not found",
        }, 404);
      }

      // Delete all messages first (foreign key constraint)
      await db
        .delete(messages)
        .where(sql`chat_id = ${chat.id}`);

      // Delete the chat
      await db
        .delete(chats)
        .where(sql`id = ${chat.id}`);

      return c.json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("[ERROR] Failed to delete chat:", error);
      return c.json({
        success: false,
        error: "Failed to delete chat",
      }, 500);
    }
  });
