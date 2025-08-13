import { chatUrls } from "@/features/chat/lib/api/chat.url";
import type { ErrorResponse, SuccessResponse } from "@/config/types";

import { API } from "@/lib/api-client";
import type { IChat } from "@/features/chat/types/chat";

interface INewChat {
  chatId?: string | null;
  msg: string;
}

class ChatService {
  async getAllChats(): Promise<SuccessResponse<IChat[]> | ErrorResponse> {
    return (await API.get(chatUrls.getAll)).data;
  }

  async getSingleChat(
    slug: string,
  ): Promise<SuccessResponse<IChat> | ErrorResponse> {
    return (await API.get(`${chatUrls.getSingle}/${slug}`)).data;
  }

  async deleteChat(chatId: string): Promise<SuccessResponse | ErrorResponse> {
    return (await API.delete(`${chatUrls.delete}/${chatId}`)).data;
  }

  async chat(data: INewChat) {
    return (await API.post(chatUrls.chat, data)).data;
  }
}

export const chatService = new ChatService();
