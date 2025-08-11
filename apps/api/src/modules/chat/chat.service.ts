import { Service } from "honestjs";
import type { User } from "better-auth";
import { v4 as uuidV4 } from "uuid";

import { streamText } from "hono/streaming";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { google } from "@packages/llm/models/google";

import { db } from "@/db";
import { chats, messages } from "@/db/schema/chat";

import type { NewChatDto } from "./dto/new-chat";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";

@Service()
export default class ChatService {
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
      const rawSlug = body.msg?.slice(0, 30).toLowerCase() ?? "new-chat";

      // Remove special characters except spaces, then replace spaces with "-"
      const sanitizedSlug = rawSlug
        .replace(/[^a-z0-9\s-]/g, "") // keep a-z, 0-9, space, and hyphen
        .trim()
        .replace(/\s+/g, "-"); // replace spaces with "-"

      const slug = `${sanitizedSlug}-${uuidV4()}`;

      const chat = await db
        .insert(chats)
        .values({
          title: body.msg?.slice(0, 15).toLowerCase(),
          slug: slug,
          userId: user.id,
        })
        .returning();

      const chatSlug = chat[0].slug;

      await db.insert(messages).values({
        chatId: chat[0].id,
        role: "user",
        content: body.msg,
      });

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a helpful AI assistant. Use the provided context to answer the user's question.",
        ],
        ["user", "Question:\n{input}"],
      ]);

      const chain = RunnableSequence.from([
        prompt,
        google,
        new StringOutputParser(),
      ]);

      const stream = await chain.stream({ input: body.msg });

      let response = "";

      return streamText(c, async (writer) => {
        for await (const chunk of stream) {
          response += chunk;
          await writer.write(chunk);
        }

        // Now send chatId to client as a special final event
        await writer.write(`[CHAT_SLUG]:${chatSlug}`);
        await writer.close();

        await db.insert(messages).values({
          chatId: chat[0].id,
          role: "assistant",
          content: response,
        });
      });
    } catch (error) {
      console.log({ error });
    }
  }
}
