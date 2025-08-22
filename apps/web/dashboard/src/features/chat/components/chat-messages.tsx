import { useEffect, useRef, useState } from "react";
import { Loader2Icon, ChevronDownIcon, SparklesIcon, BotIcon, UserIcon } from "lucide-react";

import type { IMessage } from "@/features/chat/types/chat";

import Message from "./message";

interface ChatMessagesProps {
  messages: IMessage[];
  isThinking?: boolean;
  isLoading?: boolean;
  isNew?: boolean;
  chatInputHeight?: number;
}

export default function ChatMessages({
  messages,
  isThinking,
  isLoading,
  isNew,
  chatInputHeight = 200,
}: ChatMessagesProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current && parentRef.current) {
      // Calculate scroll position accounting for chat input height
      const scrollTop = Math.max(0, parentRef.current.scrollHeight - parentRef.current.clientHeight - chatInputHeight);
      
      // Use smooth scrolling for better UX
      parentRef.current.scrollTo({
        top: scrollTop,
        behavior: "smooth"
      });
      
      // Fallback: also scroll the anchor into view as backup
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    // Auto-scroll when messages change or when assistant is thinking
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const scrollContainer = parentRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Nurospace AI</h3>
          <p className="text-sm text-muted-foreground">Loading your conversation...</p>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="flex flex-col w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      ref={parentRef}
    >
      {/* Welcome Screen */}
      {isNew && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent gradient-text-animate">
                Welcome to Nurospace AI
        </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your intelligent assistant for research, analysis, and creative problem-solving
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <BotIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Research & Analysis</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Get insights from documents and web search</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Creative Solutions</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Brainstorm ideas and solve complex problems</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      {messages.length > 0 && (
        <div className="flex-1 space-y-0">
          {messages.map((msg, index) => (
            <div
              key={msg.id || msg.timestamp}
              className={`group relative chat-message-enter bg-transparent border-b border-gray-100 dark:border-gray-800/50`}
            >
              <div className="max-w-4xl mx-auto px-4 py-1">
                {msg.role === "user" ? (
                  /* User Message - Right Side */
                  <div className="flex items-start justify-end">
                    <div className="flex items-end max-w-3xl">
                      {/* Message Bubble */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <Message {...msg} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI Message - Left Side */
                  <div className="flex items-start space-x-2">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                        <BotIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          Nurospace AI
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <Message {...msg} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isNew && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto">
              <SparklesIcon className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Start a conversation to get help from Nurospace AI</p>
            </div>
          </div>
        </div>
      )}

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="bg-transparent border-b border-gray-100 dark:border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <BotIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Nurospace AI</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Processing your request...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} className="h-4" />
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-40 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          title="Scroll to bottom"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
}
