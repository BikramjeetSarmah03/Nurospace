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
      const slug = this.generateSlug(body.msg ?? "new-chat");

      const chat = await this.createChat(
        body.msg?.slice(0, 15).toLowerCase() ?? "new chat",
        slug,
        user.id,
      );

      await this.messageService.createMessage(chat.id, "user", body.msg);

      const stream = await this.runLLMStream(body.msg ?? "");

      let response = "";

      // page no 10,
      // para 5
      // line 10

      return streamText(c, async (writer) => {
        for await (const chunk of stream) {
          response += chunk;
          await writer.write(chunk);
        }

        await writer.write(`[CHAT_SLUG]:${chat.slug}`);
        await writer.close();

        await this.messageService.createMessage(chat.id, "assistant", response);
      });
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

  async runLLMStream(input: string) {
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

    return await chain.stream({ input });
  }
}
