import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiClient } from "@/lib/api-client";

import ChatBox from "@/features/chats/components/chat-box";
import { ResourceToolbar } from "@/features/chats/components/resource-toolbar";

type Chat = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
};

export default function NewChat() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.chat.$get();
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.chats) {
            setChats(data.chats);
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  const handleSendChat = async (value: string) => {
    try {
      // Create a slug from the message
      const slug = value.toLowerCase().slice(0, 10).replaceAll(" ", "-");
      
      // Send the message to create the chat
      const response = await apiClient.chat.$post({
        json: {
          message: value,
          slug: slug,
        },
      });

      if (response.ok) {
        // Navigate to the new chat
        navigate({
          to: "/c/$chatId",
          params: {
            chatId: slug,
          },
        });
      } else {
        console.error("Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleChatClick = (slug: string) => {
    navigate({
      to: "/c/$chatId",
      params: {
        chatId: slug,
      },
    });
  };

  return (
    <div className="flex flex-col bg-background/90 h-full">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading chats...</p>
          </div>
        </div>
      ) : chats.length > 0 ? (
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Chats</h2>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.slug)}
                className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
              >
                <h3 className="font-medium text-foreground">{chat.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h1 className="flex-1 mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
          What can I help you ship?
        </h1>
      )}

      <div className="space-y-4 mx-auto mb-4 w-full max-w-[calc(100%-2rem)]">
        <ResourceToolbar />

        {/* Chat input */}
        <ChatBox onSubmit={handleSendChat} />
      </div>
    </div>
  );
}
