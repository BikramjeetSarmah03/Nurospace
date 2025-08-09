import { useState } from "react";
import { ArrowUpIcon, Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";

import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        setValue("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-8 mx-auto p-4 py-24 w-full max-w-4xl h-full">
      <h1 className="pb-1 font-medium text-3xl tracking-tight">
        How can I help today?
      </h1>

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
                "min-h-[60px]",
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="group flex items-center gap-1 hover:bg-secondary/50 p-2 rounded-lg"
              >
                <Paperclip className="w-4 h-4" />
                <span className="hidden group-hover:inline text-xs transition-opacity">
                  Attach
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "flex justify-between items-center gap-1 px-1.5 py-1.5 border border-border rounded-lg text-sm transition-colors",
                  value.trim() ? "bg-white text-black" : "text-zinc-400",
                )}
              >
                <ArrowUpIcon
                  className={cn(
                    "w-4 h-4",
                    value.trim() ? "text-black" : "text-zinc-400",
                  )}
                />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VercelV0Chat;
