import { useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";

import env from "@packages/env/client";

import { queryClient } from "@/lib/query-client";
import { authClient } from "@/lib/auth-client";

import { CHAT_QUERY } from "@/features/chat/lib/query-keys/chat";
import { chatUrls } from "@/features/chat/lib/api/chat.url";

import type { IChat, IMessage } from "@/features/chat/types/chat";

interface ResourceDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  userId: string;
}

import ChatMessages from "@/features/chat/components/chat-messages";
import ChatBox from "@/features/chat/components/chat-box";

export function ChatPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [canStop, setCanStop] = useState(false);
  const navigate = useNavigate();
  const user = authClient.useSession().data?.user;
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopChat = async () => {
    if (abortControllerRef.current) {
      // Cancel the frontend request
      abortControllerRef.current.abort();
      abortControllerRef.current = null;

      // Send cancellation signal to backend
      try {
        await fetch(`${env.VITE_SERVER_URL}/api/v1/chat/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            chatSlug: messages.length > 0 ? "cancelled" : undefined,
          }),
        });
      } catch (error) {
        console.log("Backend cancellation request failed:", error);
        // Continue with frontend cleanup even if backend fails
      }

      // Clean up frontend state
      setCanStop(false);
      setLoading(false);

      // Keep the user message, only remove any incomplete AI response
      setMessages((prev) => {
        // Keep all messages except the last one if it's an incomplete AI response
        const lastMessage = prev[prev.length - 1];
        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          lastMessage.content.length < 10
        ) {
          // Remove incomplete AI response (less than 10 characters)
          return prev.slice(0, -1);
        }
        return prev; // Keep all messages if no incomplete AI response
      });

      toast.info("Chat cancelled successfully");
    }
  };

  const handleSendChat = async (
    value: string,
    context?: { documents: ResourceDocument[] },
    mode?: "normal" | "max" | "power",
  ) => {
    let chatSlug = "";

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: value,
        timestamp: new Date().toISOString(),
      },
    ]);
    setLoading(true);
    setCanStop(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    let _assistantReply = "";

    try {
      const res = await fetch(
        `${env.VITE_SERVER_URL}/api/v1/${chatUrls.chat}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cancel-request": "false", // Track cancellation state
          },
          credentials: "include", // ✅ send cookies
          body: JSON.stringify({
            msg: value,
            mode: mode || "normal", // Include mode in payload
          }),
          signal: abortControllerRef.current.signal,
        },
      );

      if (!res.ok || !res.body) {
        toast.error("Chat request failed");
        setLoading(false);
        setCanStop(false);
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
            updated.push({
              role: "assistant",
              content: chunk,
              timestamp: new Date().toISOString(),
            });
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
            {
              role: "assistant",
              content: _assistantReply,
              timestamp: new Date().toISOString(),
            },
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
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled, don't show error
        return;
      }
      toast.error("Chat request failed");
    } finally {
      setLoading(false);
      setCanStop(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-0 min-h-0">
        <ChatMessages messages={messages} isThinking={loading} isNew />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="sticky bottom-0 p-4 rounded-lg bg-background">
        <ChatBox
          onSubmit={handleSendChat}
          onStop={handleStopChat}
          canStop={canStop}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
