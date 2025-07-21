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

export const chatRoutes = new Hono().post(
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
        const [data] = await db
          .select({ id: chats.id })
          .from(chats)
          .where(sql`slug = ${slug} AND user_id = ${userId}`)
          .limit(1);
        if (!data) throw new Error("Chat not found");
        chatId = data;
        console.log("[DEBUG] Found existing chat:", chatId, "Slug:", slug);
      }

      // 💬 Save user message
      await db.insert(messages).values({
        chatId: chatId.id,
        role: "user",
        content: message,
      });
      console.log("[DEBUG] Saved user message for chat:", chatId.id);

      let agent = createAgent();
      console.log("[DEBUG] Starting agent stream...");

      // Add system message only for new conversations
      const agentMessages: BaseMessage[] = [];
      if (!slug) {
        // Only add system message for new conversations
        agentMessages.push(
          new SystemMessage(
            "You are a helpful AI assistant with access to the user's uploaded documents and resources. IMPORTANT: When the user asks about documents, files, or any uploaded content, ALWAYS use the 'retrieveRelevantChunks' tool first to search through their documents before answering. Do not ask them to specify which document - just search through all their uploaded content automatically. Only ask for clarification if the search results don't provide enough information to answer their question.",
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

          // Check if it's a rate limit error
          const errorMessage = (streamError as any)?.message || "";
          const isRateLimitError =
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests") ||
            errorMessage.includes("Quota exceeded");

          if (isRateLimitError) {
            await writer.write(
              "I'm currently experiencing high demand. Please wait a moment and try again. If this persists, you may need to wait a few minutes before making another request.",
            );
            return;
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
);
