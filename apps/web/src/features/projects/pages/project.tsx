import { useState, useEffect, useRef } from "react";
import ChatBox from "../components/chat-box";
import { apiClient } from "@/lib/api-client";

// Example message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div>
      {/* Chat area */}
      <div
        className="flex flex-col flex-grow space-y-4 bg-gray-50/20 shadow-inner p-4 w-full overflow-y-auto"
        style={{
          scrollbarWidth: "none",
        }}
      >
        {messages.length === 0 && (
          <h1 className="mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
            What can I help you ship?
          </h1>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.role + i.toString()}
            className={`w-fit max-w-[90%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-blue-100 text-right"
                : "self-start bg-gray-100"
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

      {/* Chat input */}
      <ChatBox
        onSubmit={handleSendChat}
        className="mx-auto mb-4 max-w-[calc(100%-2rem)]"
      />
    </div>
  );
}
