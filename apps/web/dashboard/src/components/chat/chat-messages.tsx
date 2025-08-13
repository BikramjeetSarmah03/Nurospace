import { useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";

import type { IMessage } from "@/types/chat";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return isLoading ? (
    <div className="flex-grow place-items-center grid">
      <Loader2Icon className="size-10 animate-spin" />
    </div>
  ) : (
    <div
      className="flex flex-col flex-grow space-y-4 w-full max-h-[calc(100vh-16rem)] overflow-y-auto"
      style={{
        scrollbarWidth: "none",
      }}
    >
      {isNew && messages.length === 0 && (
        <h1 className="mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
          What can I help you ship?
        </h1>
      )}

      {messages.map((msg) => (
        <Message {...msg} key={msg.id} />
      ))}

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
