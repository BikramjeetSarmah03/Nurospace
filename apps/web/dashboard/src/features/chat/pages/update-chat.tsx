import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import ChatBox from "@/components/features/chat/chat-box";
import ChatMessages from "@/components/features/chat/chat-messages";

import { CHAT_QUERY } from "@/features/chat/lib/query-keys/chat";

import { chatService } from "@/features/chat/services/chat.service";
import { queryClient } from "@/lib/query-client";

import type { IChat } from "@/features/chat/types/chat";

export function UpdateChatPage() {
  const params = useParams({
    from: "/_protected/c/$slug",
  });

  const initialChat = queryClient.getQueryData<{
    success: boolean;
    data: IChat;
  }>([CHAT_QUERY.CHATS, params.slug]);

  const placeholderChat: IChat = {
    id: initialChat?.data?.id ?? "",
    slug: initialChat?.data?.slug ?? "",
    title: initialChat?.data?.title ?? "Loading...",
    userId: initialChat?.data?.userId ?? "",
    createdAt: initialChat?.data?.createdAt ?? new Date().toISOString(),
    messages: initialChat?.data?.messages ?? [],
  };

  const { isLoading, data: chatData } = useQuery({
    queryKey: [CHAT_QUERY.CHATS, params.slug],
    queryFn: async () => await chatService.getSingleChat(params.slug),
    initialData: {
      success: true,
      data: placeholderChat,
      message: "placeholder",
    },
  });

  const chat = chatData?.success ? chatData.data : null;

  const handleSendChat = async () => {};

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-8 mx-auto p-4 w-full max-w-4xl h-full">
      {/* <AnimatedAIChat /> */}

      <ChatMessages messages={chat?.messages || []} isLoading={isLoading} />

      <ChatBox onSubmit={handleSendChat} />
    </div>
  );
}
