import { useState } from "react";
import { ArrowUpIcon, Paperclip } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";

interface ChatBoxProps {
  onSubmit: (value: string) => void;
  className?: string;
}

export function ChatBox({ onSubmit, className }: ChatBoxProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        setValue("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white border border-border rounded-xl w-full",
        className,
      )}
    >
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
            "w-full px-4 py-3",
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
              "flex items-center justify-between gap-1 rounded-lg border border-border px-1.5 py-1.5 text-sm transition-colors",
              value.trim() ? "bg-white text-black" : "text-zinc-400",
            )}
          >
            <ArrowUpIcon
              className={cn(
                "h-4 w-4",
                value.trim() ? "text-black" : "text-zinc-400",
              )}
            />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/*  <div className="bg-white w-full">
      <div className="-mx-4 sm:mx-0 mt-4 px-4 sm:px-0">
          <div className="flex sm:flex-row flex-col flex-wrap sm:justify-center items-start sm:items-center gap-2 sm:gap-3 sm:pb-2 sm:overflow-x-auto">
            <ActionButton
              icon={<ImageIcon className="w-4 h-4" />}
              label="Clone a Screenshot"
            />
            <ActionButton
              icon={<Figma className="w-4 h-4" />}
              label="Import from Figma"
            />
            <ActionButton
              icon={<FileUp className="w-4 h-4" />}
              label="Upload a Project"
            />
            <ActionButton
              icon={<MonitorIcon className="w-4 h-4" />}
              label="Landing Page"
            />
          </div>
        </div>
    </div> */
// interface ActionButtonProps {
//   icon: React.ReactNode;
//   label: string;
// }

// function ActionButton({ icon, label }: ActionButtonProps) {
//   return (
//     <Button
//       type="button"
//       variant="secondary"
//       className="flex flex-shrink-0 items-center gap-2 bg-secondary/20 px-3 sm:px-4 py-2 border border-border rounded-full w-full sm:w-auto whitespace-nowrap transition-colors"
//     >
//       {icon}
//       <span className="text-xs">{label}</span>
//     </Button>
//   );
// }

export default ChatBox;
