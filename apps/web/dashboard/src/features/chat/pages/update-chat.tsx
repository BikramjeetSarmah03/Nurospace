import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import env from "@packages/env/client";

import { queryClient } from "@/lib/query-client";
import { chatService } from "@/features/chat/services/chat.service";

import { CHAT_QUERY } from "@/features/chat/lib/query-keys/chat";
import { chatUrls } from "@/features/chat/lib/api/chat.url";

import ChatMessages from "@/features/chat/components/chat-messages";
import ChatBox from "@/features/chat/components/chat-box";

export function UpdateChatPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const params = useParams({
    from: "/_protected/c/$slug",
  });

  const { isLoading, data: chatData } = useQuery({
    queryKey: [CHAT_QUERY.CHATS, params.slug],
    queryFn: async () => await chatService.getSingleChat(params.slug),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refetches
  });

  const chat = chatData?.success ? chatData.data : null;

  // Initialize messages from chat data
  useEffect(() => {
    if (chat?.messages) {
      setMessages(chat.messages);
    }
  }, [chat?.messages]);

  const handleSendChat = async (value: string) => {
    if (!chat?.slug) {
      toast.error("Chat not found");
      return;
    }

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setLoading(true);

    let _assistantReply = "";

    const res = await fetch(`${env.VITE_SERVER_URL}/api/v1/${chatUrls.chat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ send cookies
      body: JSON.stringify({
        msg: value,
        slug: chat.slug, // Use the existing chat slug to continue conversation
      }),
    });

    if (!res.ok || !res.body) {
      toast.error("Chat request failed");
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    const timeoutMs = 30000; // 30s max
    const start = Date.now();

    while (true) {
      if (Date.now() - start > timeoutMs) break;

      const readerVal = await reader?.read();

      if (readerVal?.done) break;

      const chunk = decoder.decode(readerVal?.value, { stream: true });

      // ✅ Detect chatId marker
      if (chunk.startsWith("[CHAT_SLUG]:")) {
        continue; // don't render this as AI text
      }

      _assistantReply += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1].content += chunk;
        } else {
          updated.push({ role: "assistant", content: chunk });
        }
        return [...updated];
      });
    }

    setLoading(false);

    // Invalidate the chat query to refresh the data
    queryClient.invalidateQueries({
      queryKey: [CHAT_QUERY.CHATS, params.slug],
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-0 min-h-0">
        <ChatMessages
          messages={messages}
          isThinking={loading}
          isLoading={isLoading && !chat}
        />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="sticky bottom-0 bg-background p-4">
        <ChatBox onSubmit={handleSendChat} />
      </div>
    </div>
  );
}
