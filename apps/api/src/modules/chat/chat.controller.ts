import { Body, Controller, Post, UseGuards } from "honestjs";

import { AuthGuard } from "@/modules/auth/auth.guard";

import type { NewChatDto } from "./dto/new-chat";

import ChatService from "./chat.service";

@Controller("chat")
@UseGuards(AuthGuard)
export default class ChatController {
  private chatService = new ChatService();

  @Post("")
  async newChat(@Body() body: NewChatDto) {
    return this.chatService.newChat(body);
  }
}
