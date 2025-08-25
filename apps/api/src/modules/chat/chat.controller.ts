import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Ctx,
  UseGuards,
} from "honestjs";
import type { Context } from "hono";
import type { User } from "better-auth";

import { AuthGuard } from "@/modules/auth/auth.guard";

import type { NewChatDto } from "./dto/new-chat";

import ChatService from "./chat.service";
import { AuthContext, type IAuthContext } from "../auth/auth.decorator";
import {
  getAvailableMentionOptions,
  validateMentionMapping,
} from "@/lib/mention-system";

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

  @Post("cancel")
  async cancelChat(
    @Body() body: { chatSlug?: string },
    @AuthContext() context: IAuthContext,
  ) {
    return this.chatService.cancelChat(body.chatSlug, context.user);
  }

  @Delete(":id")
  async deleteChat(
    @Param("id") chatId: string,
    @AuthContext() context: IAuthContext,
  ) {
    return this.chatService.deleteChat(chatId, context.user);
  }

  /**
   * Get available mention options for frontend
   */
  async getMentionOptions(c: Context) {
    try {
      const mentionOptions = getAvailableMentionOptions();

      return {
        success: true,
        data: mentionOptions,
        message: "Mention options retrieved successfully",
      };
    } catch (error) {
      console.error("[MENTION] Error getting mention options:", error);
      return {
        success: false,
        message: "Failed to get mention options",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate frontend-backend mention mapping
   */
  async validateMentions(c: Context) {
    try {
      const validation = validateMentionMapping();

      return {
        success: true,
        data: validation,
        message: validation.valid
          ? "All mention mappings are valid"
          : "Found issues with mention mappings",
      };
    } catch (error) {
      console.error("[MENTION] Error validating mentions:", error);
      return {
        success: false,
        message: "Failed to validate mentions",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
