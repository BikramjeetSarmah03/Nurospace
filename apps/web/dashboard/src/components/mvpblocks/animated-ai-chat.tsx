"use client";

import { useEffect, useRef, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Figma,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useAutoResizeTextarea } from "@/features/chat/hooks/use-auto-resize-textarea";

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const r = ref;

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex bg-background px-3 py-2 border border-input rounded-md w-full min-h-[80px] text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing
              ? "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              : "",
            className,
          )}
          ref={r}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md ring-2 ring-primary/30 ring-offset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div
            className="right-2 bottom-2 absolute bg-primary opacity-0 rounded-full w-2 h-2"
            style={{
              animation: "none",
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

const commandSuggestions: CommandSuggestion[] = [
  {
    icon: <ImageIcon className="w-4 h-4" />,
    label: "Clone UI",
    description: "Generate a UI from a screenshot",
    prefix: "/clone",
  },
  {
    icon: <Figma className="w-4 h-4" />,
    label: "Import Figma",
    description: "Import a design from Figma",
    prefix: "/figma",
  },
  {
    icon: <MonitorIcon className="w-4 h-4" />,
    label: "Create Page",
    description: "Generate a new web page",
    prefix: "/page",
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: "Improve",
    description: "Improve existing UI design",
    prefix: "/improve",
  },
];

export default function AnimatedAIChat() {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [_isPending, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [_recentCommand, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value),
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1,
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue("");
          adjustHeight(true);
        }, 3000);
      });
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="flex w-full h-full overflow-x-hidden">
      <div className="relative flex flex-col justify-center items-center bg-transparent p-6 w-full h-full overflow-hidden text-foreground">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="top-0 left-1/4 absolute bg-primary/10 blur-[128px] rounded-full w-96 h-96 animate-pulse mix-blend-normal filter" />
          <div className="right-1/4 bottom-0 absolute bg-secondary/10 blur-[128px] rounded-full w-96 h-96 animate-pulse delay-700 mix-blend-normal filter" />
          <div className="top-1/4 right-1/3 absolute bg-primary/10 blur-[96px] rounded-full w-64 h-64 animate-pulse delay-1000 mix-blend-normal filter" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl">
          <motion.div
            className="z-10 relative space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="space-y-3 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block"
              >
                <h1 className="pb-1 font-medium text-3xl tracking-tight">
                  How can I help today?
                </h1>
                <motion.div
                  className="bg-gradient-to-r from-transparent via-primary/50 to-transparent h-px"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.div>
              <motion.p
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Type a command or ask a question
              </motion.p>
            </div>

            <motion.div
              className="relative bg-card/80 shadow-2xl backdrop-blur-2xl border border-border rounded-2xl"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AnimatePresence>
                {showCommandPalette && (
                  <motion.div
                    ref={commandPaletteRef}
                    className="right-4 bottom-full left-4 z-50 absolute bg-background/90 shadow-lg backdrop-blur-xl mb-2 border border-border rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="bg-background py-1">
                      {commandSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion.prefix}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                            activeSuggestion === index
                              ? "bg-primary/20 text-foreground"
                              : "text-muted-foreground hover:bg-primary/10",
                          )}
                          onClick={() => selectCommandSuggestion(index)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <div className="flex justify-center items-center w-5 h-5 text-primary">
                            {suggestion.icon}
                          </div>
                          <div className="font-medium">{suggestion.label}</div>
                          <div className="ml-1 text-muted-foreground text-xs">
                            {suggestion.prefix}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask any question..."
                  containerClassName="w-full"
                  className={cn(
                    "px-4 py-3 w-full",
                    "resize-none",
                    "bg-transparent",
                    "border-none",
                    "text-foreground text-sm",
                    "focus:outline-none",
                    "placeholder:text-muted-foreground",
                    "min-h-[60px]",
                  )}
                  style={{
                    overflow: "hidden",
                  }}
                  showRing={false}
                />
              </div>

              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 px-4 pb-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {attachments.map((file, index) => (
                      <motion.div
                        key={index.toString()}
                        className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg text-muted-foreground text-xs"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <span>{file}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center gap-4 p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={handleAttachFile}
                    whileTap={{ scale: 0.94 }}
                    className="group relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    <motion.span
                      className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                      layoutId="button-highlight"
                    />
                  </motion.button>
                  <motion.button
                    type="button"
                    data-command-button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommandPalette((prev) => !prev);
                    }}
                    whileTap={{ scale: 0.94 }}
                    className={cn(
                      "group relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                      showCommandPalette && "bg-primary/20 text-foreground",
                    )}
                  >
                    <Command className="w-4 h-4" />
                    <motion.span
                      className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                      layoutId="button-highlight"
                    />
                  </motion.button>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isTyping || !value.trim()}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    "flex items-center gap-2",
                    value.trim()
                      ? "bg-primary text-primary-foreground shadow-primary/10 shadow-lg"
                      : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  {isTyping ? (
                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                  ) : (
                    <SendIcon className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </motion.button>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-2">
              {commandSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.prefix}
                  onClick={() => selectCommandSuggestion(index)}
                  className="group relative flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {suggestion.icon}
                  <span>{suggestion.label}</span>
                  <motion.div
                    className="absolute inset-0 border border-border/50 rounded-lg"
                    initial={false}
                    animate={{
                      opacity: [0, 1],
                      scale: [0.98, 1],
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="bottom-8 z-50 fixed bg-background/80 shadow-lg backdrop-blur-2xl mx-auto px-4 py-2 border border-border rounded-full transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-primary/10 rounded-full w-8 h-7 text-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>Thinking</span>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {inputFocused && (
          <motion.div
            className="z-0 fixed bg-gradient-to-r from-primary via-primary/80 to-secondary opacity-[0.02] blur-[96px] rounded-full w-[50rem] h-[50rem] pointer-events-none"
            animate={{
              x: mousePosition.x - 400,
              y: mousePosition.y - 400,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            }}
          />
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="bg-primary mx-0.5 rounded-full w-1.5 h-1.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

// interface ActionButtonProps {
//   icon: React.ReactNode;
//   label: string;
// }

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = rippleKeyframes;
  document.head.appendChild(style);
}
