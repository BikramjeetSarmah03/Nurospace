import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useAutoResizeTextarea } from "@/features/chat/hooks/use-auto-resize-textarea";

import { Textarea } from "@/components/ui/textarea";

interface ChatBoxProps {
  onSubmit: (value: string) => void;
}

export default function ChatBox({ onSubmit }: ChatBoxProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      onSubmit(value);

      if (value.trim()) {
        setValue("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-white border border-border rounded-xl">
        <div className="overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask v0 a question..."
            className={cn(
              "px-4 py-3 w-full",
              "resize-none",
              "bg-transparent",
              "border-none",
              "text-sm",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-sm",
              "min-h-[60px]"
            )}
            style={{
              overflow: "hidden",
            }}
          />
        </div>

        <div className="flex justify-between items-center p-3">
          <div />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex justify-between items-center gap-1 px-1.5 py-1.5 border border-border rounded-lg text-sm transition-colors",
                value.trim() ? "bg-white text-black" : "text-zinc-400"
              )}
            >
              <ArrowUpIcon
                className={cn(
                  "w-4 h-4",
                  value.trim() ? "text-black" : "text-zinc-400"
                )}
              />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
