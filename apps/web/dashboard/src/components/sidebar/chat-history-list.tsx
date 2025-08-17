import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquare, Clock, Plus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Chat = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
};

export function ChatHistoryList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.chat.$get();
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chats) {
          setChats(data.chats.slice(0, 10)); // Show last 10 chats
        }
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleChatClick = (slug: string) => {
    navigate({
      to: "/c/$chatId",
      params: { chatId: slug },
    });
  };

  const handleNewChat = () => {
    navigate({
      to: "/c",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-1">
      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        variant="ghost"
        size="sm"
        className="w-full justify-start text-primary hover:text-primary font-medium"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      {loading ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
            <span>Loading chats...</span>
          </div>
        </div>
      ) : chats.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No recent chats
        </div>
      ) : (
        chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.slug)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              "text-left"
            )}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{chat.title}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
              <Clock className="h-3 w-3" />
              <span>{formatDate(chat.createdAt)}</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
} 