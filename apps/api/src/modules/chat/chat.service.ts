import { Service } from "honestjs";

import type { NewChatDto } from "./dto/new-chat";

@Service()
export default class ChatService {
  async newChat(body: NewChatDto) {
    const data = {
      success: true,
      data: {
        chatId: body.msg,
      },
    };

    console.log({ data });
    return {
      data,
    };
  }
}
