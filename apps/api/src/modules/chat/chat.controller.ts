import {
  Body,
  Controller,
  Ctx,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "honestjs";
import type { Context } from "hono";

import { AuthGuard } from "@/modules/auth/auth.guard";

import type { NewChatDto } from "./dto/new-chat";

import ChatService from "./chat.service";
import { AuthContext, type IAuthContext } from "../auth/auth.decorator";

@Controller("chat")
@UseGuards(AuthGuard)
export default class ChatController {
  private chatService = new ChatService();

  @Get("")
  async getAllChats(@AuthContext() context: IAuthContext) {
    return this.chatService.getAllChats(context.user);
  }

  @Get(":slug")
  async getSingleChat(
    @Param("slug") chatSlug: string,
    @AuthContext() context: IAuthContext,
  ) {
    return this.chatService.getSingleChat(chatSlug, context.user);
  }

  @Post("")
  async newChat(
    @Ctx() ctx: Context,
    @Body() body: NewChatDto,
    @AuthContext() context: IAuthContext,
  ) {
    return this.chatService.newChat(ctx, body, context.user);
  }

  @Delete(":id")
  async deleteChat(
    @Param("id") chatId: string,
    @AuthContext() context: IAuthContext,
  ) {
    return this.chatService.deleteChat(chatId, context.user);
  }
}
