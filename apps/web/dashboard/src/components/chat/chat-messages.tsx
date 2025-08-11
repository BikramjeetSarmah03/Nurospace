import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { IMessage } from "@/types/chat";

interface ChatMessagesProps {
  messages: IMessage[];
  loading?: boolean;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex flex-col flex-grow space-y-4 w-full max-h-[calc(100vh-16rem)] overflow-y-auto"
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
          className={cn(
            "bg-gray-100 dark:bg-background/40 p-3 border rounded-lg w-fit max-w-[90%] text-sm whitespace-pre-wrap",
            msg.role === "user" ? "self-end text-right" : "self-start ",
          )}
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
  );
}
