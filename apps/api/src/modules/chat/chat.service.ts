import { Service } from "honestjs";
import type { User } from "better-auth";
import { v4 as uuidV4 } from "uuid";

// import { google } from "@packages/llm/models/google";

import { db } from "@/db";
import { chats } from "@/db/schema/chat";

import type { NewChatDto } from "./dto/new-chat";
import { and, eq } from "drizzle-orm";

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

  async newChat(body: NewChatDto, user: User) {
    try {
      // const res = await google.invoke("Hi are you working");

      // const data = {
      //   success: true,
      //   data: {
      //     chatId: body.msg,
      //     // msg: res,
      //   },
      // };

      const slug =
        (body.msg?.slice(0, 30).toLowerCase().replaceAll(" ", "-") ??
          "new-chat") +
        "-" +
        uuidV4();

      const chat = await db
        .insert(chats)
        .values({
          title: body.msg?.slice(0, 15).toLowerCase(),
          slug: slug,
          userId: user.id,
        })
        .returning();

      return {
        chat,
      };
    } catch (error) {
      console.log({ error });
    }
  }
}
