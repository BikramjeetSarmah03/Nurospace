import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";
import {
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { createAgent } from "@/lib/agent";
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
      console.log("[DEBUG] Saved user message for chat:", chatId.id);

      let agent = createAgent();
      console.log("[DEBUG] Starting agent stream...");

      // For existing conversations, let LangGraph memory handle context
      // For new conversations, add system message
      const agentMessages: BaseMessage[] = [];
      
      if (existingMessages.length === 0) {
        // This is a new conversation, add system message
        agentMessages.push(
          new SystemMessage(
            `You are an intelligent AI assistant with advanced reasoning capabilities and access to multiple tools and the user's uploaded documents.

🎯 CAPABILITIES:
• Document Analysis: Use 'retrieveRelevantChunks' to search through user's uploaded documents
• Web Search: Use 'tavilySearch' for current information, news, and facts
• Weather Data: Use 'getCurrentWeather' for weather information
• Time/Date: Use 'getCurrentDateTime' for current time and date

🧠 INTELLIGENT DECISION MAKING:
• CRITICAL: When asked about ANY names, people, addresses, personal details, or facts that might be in user documents → ALWAYS use retrieveRelevantChunks FIRST
• CRITICAL: When asked about "news regarding [name]" or "district of [name]" → Use retrieveRelevantChunks FIRST to check user documents
• When asked about documents, files, or uploaded content → Use retrieveRelevantChunks first
• When asked for current information, news, or facts → Use tavilySearch
• When asked about weather conditions → Use getCurrentWeather
• When asked about time/date → Use getCurrentDateTime
• For general conversation → Respond naturally

🚀 ADVANCED FEATURES:
• You can chain multiple tools if needed for comprehensive answers
• You can combine document context with web search for complete responses
• You can ask for clarification if needed
• You can provide explanations for your reasoning
• You can handle complex multi-step queries
• You learn from conversation context and improve over time

💡 REASONING APPROACH:
1. Analyze the user's query carefully
2. If it mentions ANY names, people, addresses, personal information, or asks about "news regarding [name]" → Use retrieveRelevantChunks FIRST
3. If the query contains specific names (like "Tribeni Mahanta"), ALWAYS search user documents first
4. Determine which other tools are needed
5. Execute tools in the optimal sequence
6. Synthesize information from multiple sources
7. Provide a comprehensive, accurate response

IMPORTANT: Do NOT refuse to provide information from the user's own documents. If they ask about information they have uploaded, search their documents and provide the relevant details.`
          ),
        );
      }
      
      agentMessages.push(new HumanMessage(message));

      const stream = await agent.stream(
        {
          messages: agentMessages,
        },
        {
          configurable: {
            thread_id: finalSlug,
            userId: userId,
          },
        },
      );

      return streamText(c, async (writer) => {
        let response = "";

        try {
          for await (const chunk of stream) {
            console.log("[DEBUG] Agent chunk type:", typeof chunk);
            console.log("[DEBUG] Agent chunk:", JSON.stringify(chunk, null, 2));

            // ✅ Handles both string and LangGraph object streaming
            if (typeof chunk === "string") {
              response += chunk;
              await writer.write(chunk);
            } else if (
              typeof chunk === "object" &&
              chunk !== null &&
              "agent" in chunk &&
              Array.isArray(chunk.agent.messages)
            ) {
              for (const msg of chunk.agent.messages) {
                if (
                  typeof msg === "object" &&
                  msg !== null &&
                  "content" in msg &&
                  typeof (msg as any).content === "string"
                ) {
                  response += (msg as any).content;
                  await writer.write((msg as any).content);
                }
              }
            } else if (
              typeof chunk === "object" &&
              chunk !== null &&
              "content" in chunk &&
              typeof (chunk as any).content === "string"
            ) {
              // Handle direct message objects
              response += (chunk as any).content;
              await writer.write((chunk as any).content);
            }
          }
        } catch (streamError) {
          console.error("[ERROR] Streaming error:", streamError);

          // Enhanced error classification
          const errorMessage = (streamError as any)?.message || "";
          const isRateLimitError =
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests") ||
            errorMessage.includes("Quota exceeded");
          
          const isTimeoutError = 
            errorMessage.includes("timeout") ||
            errorMessage.includes("Request timeout");
          
          const isModelError = 
            errorMessage.includes("model") ||
            errorMessage.includes("generation") ||
            errorMessage.includes("token");

          // Handle different error types with appropriate responses
          if (isRateLimitError) {
            await writer.write(
              "I'm currently experiencing high demand. Please wait a moment and try again. If this persists, you may need to wait a few minutes before making another request.",
            );
            return;
          } else if (isTimeoutError) {
            await writer.write(
              "The request took too long to process. Please try a simpler query or try again later.",
            );
            return;
          } else if (isModelError) {
            await writer.write(
              "I encountered an issue with my reasoning process. Let me try a different approach.",
            );
            // Continue to fallback
          }

          // If streaming fails, try with fallback model
          try {
            console.log("[DEBUG] Trying fallback model...");
            agent = createAgent(true); // Use fallback model

            const directResponse = await agent.invoke(
              {
                messages: agentMessages,
              },
              {
                configurable: {
                  thread_id: finalSlug,
                  userId: userId,
                },
              },
            );

            if (
              directResponse &&
              typeof directResponse === "object" &&
              "agent" in directResponse
            ) {
              const agentResponse = directResponse as {
                agent: { messages: any[] };
              };
              const messages = agentResponse.agent.messages;
              for (const msg of messages) {
                if (
                  msg &&
                  typeof msg === "object" &&
                  "content" in msg &&
                  typeof (msg as any).content === "string"
                ) {
                  response += (msg as any).content;
                  await writer.write((msg as any).content);
                }
              }
            }
          } catch (fallbackError) {
            console.error("[ERROR] Fallback error:", fallbackError);
            await writer.write(
              "I apologize, but I'm currently experiencing technical difficulties. Please try again in a few minutes.",
            );
          }
        }

        console.log("[DEBUG] Final response:", response);

        // ✅ Save only the final accumulated response
        if (response.trim()) {
          await db.insert(messages).values({
            chatId: chatId.id,
            role: "assistant",
            content: response,
          });
          console.log("[DEBUG] Saved assistant response for chat:", chatId.id);
        }
      });
    } catch (error) {
      console.error("[ERROR] chatRoutes handler:", error);
      throw error;
    }
  },
)
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
