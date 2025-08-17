import { useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";

import type { IMessage } from "@/features/chat/types/chat";

import Message from "./message";

interface ChatMessagesProps {
  messages: IMessage[];
  isThinking?: boolean;
  isLoading?: boolean;
  isNew?: boolean;
}

export default function ChatMessages({
  messages,
  isThinking,
  isLoading,
  isNew,
}: ChatMessagesProps) {
  const parentRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return isLoading ? (
    <div className="flex items-center justify-center h-full">
      <Loader2Icon className="size-10 animate-spin" />
    </div>
  ) : (
    <div
      className="flex flex-col space-y-4 w-full h-full overflow-y-auto chat-scrollbar"
      ref={parentRef}
    >
      {isNew && messages.length === 0 && (
        <h1 className="mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
          What can I help you ship?
        </h1>
      )}

      {messages.length > 0 ? (
        messages.map((msg) => (
          <Message {...msg} key={msg.id || msg.timestamp} />
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No messages yet. Start a conversation!
        </div>
      )}

      {isThinking && (
        <div className="self-start text-muted-foreground text-sm">
          Assistant is typing...
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
