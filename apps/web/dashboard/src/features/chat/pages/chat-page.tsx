import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import env from "@packages/env/client";

import { queryClient } from "@/lib/query-client";
import { authClient } from "@/lib/auth-client";

import { CHAT_QUERY } from "@/features/chat/lib/query-keys/chat";
import { chatUrls } from "@/features/chat/lib/api/chat.url";

import type { IChat, IMessage } from "@/features/chat/types/chat";

import ChatMessages from "@/features/chat/components/chat-messages";
import ChatBox from "@/features/chat/components/chat-box";

export function ChatPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = authClient.useSession().data?.user;

  const handleSendChat = async (value: string) => {
    let chatSlug = "";

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
      body: JSON.stringify({ msg: value }),
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
        chatSlug = chunk.split("[CHAT_SLUG]:")[1];
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

    queryClient.invalidateQueries({
      queryKey: [CHAT_QUERY.CHATS],
    });

    if (chatSlug.trim() !== "") {
      const seededChat: IChat = {
        id: crypto.randomUUID(), // temp ID until refetch
        slug: chatSlug,
        title: value.slice(0, 30) || "New Chat",
        userId: user?.id || "", // you should have this in context
        createdAt: new Date().toISOString(),
        messages: [
          ...messages, // your local state (user + assistant so far)
          { role: "assistant", content: _assistantReply },
        ],
      };

      queryClient.setQueryData([CHAT_QUERY.CHATS, chatSlug], {
        success: true,
        data: seededChat,
      });
      navigate({
        to: "/c/$slug",
        params: {
          slug: chatSlug,
        },
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-0 min-h-0">
        <ChatMessages messages={messages} isThinking={loading} isNew />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="sticky bottom-0 bg-background p-4">
        <ChatBox onSubmit={handleSendChat} />
      </div>
    </div>
  );
}
