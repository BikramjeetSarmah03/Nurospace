import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import type { IMessage } from "@/features/chat/types/chat";
import { cn } from "@/lib/utils";

interface MessageProps extends IMessage {
  className?: string;
}

const Message = React.memo(({ className, content, role }: MessageProps) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-background/40 p-3 border rounded-lg w-fit max-w-[90%] lg:max-w-[70%] text-sm whitespace-pre-wrap",
        role === "user" ? "self-end text-right" : "self-start ",
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
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default Message;
