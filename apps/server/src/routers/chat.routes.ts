import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "@/lib/agent";
import { chats, messages } from "@/db/schema/chat";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { isAuthenticated } from "@/middleware/auth";
import { resourceEmbeddings } from "@/db/schema/resource";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import {
  retrieveRelevantChunks,
  retrieveRelevantChunksTool,
} from "@/tool/retrieveRelevantChunks";
import type { ToolRunnableConfig } from "@langchain/core/tools";

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

      // Debug: Manually invoke the tool to verify it works
      // Note: ToolRunnableConfig does not accept userId, so we remove it from the config
      const toolContext = await retrieveRelevantChunksTool.invoke(message, {
        userId,
      } as ToolRunnableConfig & { userId: string });
      console.log("[DEBUG] Tool manual call result:", toolContext);

      // Retrieve context chunks for the message and user
      const contextChunks = await retrieveRelevantChunks(message, userId); // no resourceId
      const context = contextChunks.join("\n\n");
      console.log("[DEBUG] Retrieved context chunks:", contextChunks);

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

      const agent = createAgent();
      console.log("[DEBUG] Starting agent stream...");
      const stream = await agent.stream(
        {
          messages: [new HumanMessage(message)],
        },
        {
          configurable: {
            thread_id: finalSlug,
            userId: userId,
          },
        },
      );

      const response = "";

      return streamText(c, async (writer) => {
        let response = "";

        for await (const chunk of stream) {
          console.log("[DEBUG] Agent chunk:", chunk);

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
          }
        }
        console.log("[DEBUG] Response:", response);

        // ✅ Save only the final accumulated response
        await db.insert(messages).values({
          chatId: chatId.id,
          role: "assistant",
          content: response,
        });

        console.log("[DEBUG] Saved assistant response for chat:", chatId.id);
      });
    } catch (error) {
      console.error("[ERROR] chatRoutes handler:", error);
      throw error;
    }
  },
);
