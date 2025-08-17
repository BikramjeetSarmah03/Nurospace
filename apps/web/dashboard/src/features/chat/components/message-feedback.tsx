import React from "react";
import { Copy, ThumbsUp, ThumbsDown, Volume2, RotateCcw, Check, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessageFeedback } from "@/features/chat/hooks/use-message-feedback";

interface MessageFeedbackProps {
  messageId: string;
  messageContent: string;
  onCopy?: () => void;
  onGoodResponse?: () => void;
  onBadResponse?: () => void;
  onReadAloud?: () => void;
  onRetry?: () => void;
  className?: string;
}

export default function MessageFeedback({
  messageId,
  messageContent,
  onCopy,
  onGoodResponse,
  onBadResponse,
  onReadAloud,
  onRetry,
  className,
}: MessageFeedbackProps) {
  const {
    copied,
    feedback,
    isReading,
    handleCopy: copyContent,
    handleFeedback,
    handleReadAloud: readContent,
    handleRetry: retryAction,
  } = useMessageFeedback();

  const handleCopy = async () => {
    await copyContent(messageContent);
    onCopy?.();
  };

  const handleGoodResponse = () => {
    handleFeedback("good");
    onGoodResponse?.();
  };

  const handleBadResponse = () => {
    handleFeedback("bad");
    onBadResponse?.();
  };

  const handleReadAloud = () => {
    readContent(messageContent);
    onReadAloud?.();
  };

  const handleRetry = () => {
    retryAction();
    onRetry?.();
  };

  return (
    <div className={cn("flex items-center gap-1 mt-3 pt-2 border-t border-border/20 opacity-0 group-hover:opacity-100 transition-all duration-200", className)}>
      {/* Copy */}
      <button
        onClick={handleCopy}
        className={cn(
          "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105",
          copied && "text-green-600 bg-green-50 dark:bg-green-950/20"
        )}
        title="Copy message"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Good Response */}
      <button
        onClick={handleGoodResponse}
        className={cn(
          "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105",
          feedback === "good" && "text-green-600 bg-green-50 dark:bg-green-950/20"
        )}
        title="Good response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      {/* Bad Response */}
      <button
        onClick={handleBadResponse}
        className={cn(
          "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105",
          feedback === "bad" && "text-red-600 bg-red-50 dark:bg-red-950/20"
        )}
        title="Bad response"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      {/* Read Aloud / Stop */}
      <button
        onClick={handleReadAloud}
        className={cn(
          "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105",
          isReading && "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
        )}
        title={isReading ? "Stop reading" : "Read aloud"}
      >
        {isReading ? (
          <Square className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Retry */}
      <button
        onClick={handleRetry}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105"
        title="Retry"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
