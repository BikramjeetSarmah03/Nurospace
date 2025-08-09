import { Service } from "honestjs";

// import { google } from "@packages/llm/models/google";

import type { NewChatDto } from "./dto/new-chat";

@Service()
export default class ChatService {
  async newChat(body: NewChatDto) {
    // const res = await google.invoke("Hi are you working");

    const data = {
      success: true,
      data: {
        chatId: body.msg,
        // msg: res,
      },
    };

    console.log({ data });
    return {
      data,
    };
  }
}
