import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";

import ChatBox from "@/features/chats/components/chat-box";
import { ResourceToolbar } from "@/features/chats/components/resource-toolbar";

// Example message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await apiClient.chat[":slug"].$get({
          param: { slug },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages) {
            setMessages(data.messages.map((msg: any) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })));
          }
        } else if (response.status === 404) {
          // Chat doesn't exist yet, this is a new chat
          console.log("New chat, no history to load");
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // If there's an error, assume it's a new chat
        setMessages([]);
      } finally {
        setInitialLoading(false);
      }
    };

    if (slug) {
      loadChatHistory();
    }
  }, [slug]);

  // Auto-scroll on new message
  // biome-ignore lint/correctness/useExhaustiveDependencies: <needed this for auto scrolling>
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = async (value: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setLoading(true);

    let _assistantReply = "";

    const res = await apiClient.chat.$post({
      json: {
        message: value,
        slug,
      },
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const readerVal = await reader?.read();
      if (readerVal?.done) break;

      const chunk = decoder.decode(readerVal?.value);
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
  };

  return (
    <div className="flex flex-col bg-sidebar h-full">
      {/* Chat area */}
      <div
        className="flex flex-col flex-grow space-y-4 shadow-inner p-4 w-full max-h-[calc(100vh-16rem)] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
        }}
      >
        {initialLoading && (
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading chat history...</p>
          </div>
        )}

        {!initialLoading && messages.length === 0 && (
          <h1 className="mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
            What can I help you ship?
          </h1>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.role + i.toString()}
            className={`w-fit max-w-[90%] p-3 rounded-lg bg-gray-100 dark:bg-background/40 text-sm border whitespace-pre-wrap ${
              msg.role === "user" ? "self-end text-right" : "self-start "
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="self-start text-muted-foreground text-sm">
            Assistant is typing...
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-4 mx-auto mb-4 w-full max-w-[calc(100%-2rem)]">
        <ResourceToolbar />

        {/* Chat input */}
        <ChatBox onSubmit={handleSendChat} />
      </div>
    </div>
  );
}
