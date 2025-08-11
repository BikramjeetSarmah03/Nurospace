import { chatUrls } from "@/config/api/chat.urls";
import type { ErrorResponse, SuccessResponse } from "@/config/types";

import { API } from "@/lib/api-client";
import type { IChat } from "@/types/chat";

class ChatService {
  async getAllChats(): Promise<SuccessResponse<IChat[]> | ErrorResponse> {
    return (await API.get(chatUrls.getAll)).data;
  }

  async deleteChat(chatId: string): Promise<SuccessResponse | ErrorResponse> {
    return (await API.delete(`${chatUrls.delete}/${chatId}`)).data;
  }
}

export const chatService = new ChatService();
