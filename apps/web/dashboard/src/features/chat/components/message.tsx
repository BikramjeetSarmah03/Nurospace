import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import type { IMessage } from "@/features/chat/types/chat";
import { cn } from "@/lib/utils";
import MessageFeedback from "./message-feedback";

interface MessageProps extends IMessage {
  className?: string;
}

const Message = React.memo(({ className, content, role, id }: MessageProps) => {
  return (
    <div className="w-full">
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          role === "user"
            ? "prose-p:text-white prose-strong:text-white prose-headings:text-white prose-code:text-white prose-code:bg-white/20"
            : "prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          role === "user"
            ? "prose-pre:bg-white/10 prose-pre:border prose-pre:border-white/20 prose-blockquote:border-l-4 prose-blockquote:border-white/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/90 prose-ul:list-disc prose-ol:list-decimal prose-li:text-white/90"
            : "prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 dark:prose-li:text-gray-300",
          role === "user" && "text-right",
          className,
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || "");
              const r = rest.ref;
              return match ? (
                <SyntaxHighlighter
                  {...rest}
                  // @ts-expect-error
                  ref={r}
                  PreTag="div"
                  // biome-ignore lint/correctness/noChildrenProp: <its needed>
                  children={String(children).replace(/\n$/, "")}
                  language={match[1]}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: "1rem 0",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            },
            p({ children, ...props }) {
              return (
                <p {...props} className="mb-4 last:mb-0">
                  {children}
                </p>
              );
            },
            ul({ children, ...props }) {
              return (
                <ul {...props} className="mb-4 last:mb-0 space-y-1">
                  {children}
                </ul>
              );
            },
            ol({ children, ...props }) {
              return (
                <ol {...props} className="mb-4 last:mb-0 space-y-1">
                  {children}
                </ol>
              );
            },
            blockquote({ children, ...props }) {
              return (
                <blockquote {...props} className="mb-4 last:mb-0">
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Show feedback options only for AI messages */}
      {role === "assistant" && id && (
        <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
          <MessageFeedback
            messageId={id}
            messageContent={content}
            onCopy={() => console.log("Message copied")}
            onGoodResponse={() => console.log("Good response feedback")}
            onBadResponse={() => console.log("Bad response feedback")}
            onReadAloud={() => console.log("Read aloud triggered")}
            onRetry={() => console.log("Retry triggered")}
          />
        </div>
      )}
    </div>
  );
});

export default Message;
