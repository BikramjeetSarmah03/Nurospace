import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";

import { getLLM, SupportedModels } from "@/lib/llm";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { db } from "@/db";
import { resourceEmbeddings } from "@/db/schema";
import { sql } from "drizzle-orm";
import { isAuthenticated } from "@/middleware/auth";
import { chats, messages } from "@/db/schema/chat";

const NewChatSchema = z.object({
  message: z.string(),
  model: z.enum(SupportedModels).optional(),
  slug: z.string(),
});

export const chatRoutes = new Hono().post(
  "/",
  isAuthenticated,
  zValidator("json", NewChatSchema),
  async (c) => {
    const { message, model = "gemini-2.5-pro", slug } = c.req.valid("json");
    const userId = c.get("user")?.id;

    if (!userId) throw new Error("Unauthorized");

    // === Custom logic for current time requests ===
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes("current time") ||
      lowerMsg.includes("what time is it") ||
      lowerMsg.includes("time now") ||
      lowerMsg.match(/\btime\b.*\bnow\b/)
    ) {
      let chatId: { id: string };
      if (!slug) {
        const newSlug = message.toLowerCase().slice(0, 10).replaceAll(" ", "-");
        const data = await db
          .insert(chats)
          .values({ userId, title: message.slice(0, 50), slug: newSlug })
          .returning({ id: chats.id });
        chatId = data[0];
      } else {
        const data = await db
          .select({ id: chats.id })
          .from(chats)
          .where(sql`slug = ${slug} AND user_id = ${userId}`)
          .limit(1);
        if (!data[0]) {
          throw new Error("Chat not found");
        }
        chatId = data[0];
      }
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const dateString = now.toLocaleDateString();
      const response = `The current server time is ${timeString} on ${dateString}.`;
      // Store user's message
      await db.insert(messages).values({
        chatId: chatId.id,
        role: "user",
        content: message,
      });
      // Store assistant's response
      await db.insert(messages).values({
        chatId: chatId.id,
        role: "assistant",
        content: response,
      });
      return c.text(response);
    }
    // === End custom logic ===

    const llm = getLLM(model);

    const contextChunks = await retrieveRelevantChunks(message, userId); // no resourceId
    const context = contextChunks.join("\n\n");

    let chatId: { id: string };

    // 📝 1. Create a new chat or find existing by slug
    if (!slug) {
      const newSlug = message.toLowerCase().slice(0, 10).replaceAll(" ", "-");

      const data = await db
        .insert(chats)
        .values({ userId, title: message.slice(0, 50), slug: newSlug })
        .returning({ id: chats.id });
      chatId = data[0];
    } else {
      // Find the chat by slug and userId
      const data = await db
        .select({ id: chats.id })
        .from(chats)
        .where(sql`slug = ${slug} AND user_id = ${userId}`)
        .limit(1);
      if (!data[0]) {
        throw new Error("Chat not found");
      }
      chatId = data[0];
    }

    // 💬 2. Store user's message
    await db.insert(messages).values({
      chatId: chatId.id,
      role: "user",
      content: message,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful AI assistant. Use the provided context to answer the user's question.",
      ],
      ["user", "Context:\n{context}\n\nQuestion:\n{input}"],
    ]);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const stream = await chain.stream({ input: message, context });
    let response = "";

    return streamText(c, async (writer) => {
      for await (const chunk of stream) {
        response += chunk;
        await writer.write(chunk);
      }

      await db.insert(messages).values({
        chatId: chatId.id,
        role: "assistant",
        content: response,
      });
    });
  },
);

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  topK = 5,
) {
  const embeddingModel = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const queryEmbedding = await embeddingModel.embedQuery(query);

  const results = await db
    .select({ content: resourceEmbeddings.content })
    .from(resourceEmbeddings)
    .where(sql`user_id = ${userId}`)
    .orderBy(
      sql`embedding <-> ${sql.raw(`'[${queryEmbedding.join(",")}]'::vector`)}`,
    ) // cosine distance
    .limit(topK);

  return results.map((r) => r.content);
}
