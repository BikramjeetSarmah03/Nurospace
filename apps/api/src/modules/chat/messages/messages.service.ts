import { db } from "@/db";
import { messages } from "@/db/schema";
import { Service } from "honestjs";

@Service()
export default class MessageService {
  async createMessage(
    chatId: string,
    role: "assistant" | "user",
    content: string,
  ) {
    const message = await db
      .insert(messages)
      .values({
        chatId,
        role,
        content,
      })
      .returning();

    return message;
  }
}
