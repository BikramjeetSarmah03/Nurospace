import { useNavigate } from "@tanstack/react-router";

import ChatBox from "@/features/chats/components/chat-box";
import { ResourceToolbar } from "../components/resource-toolbar";

export default function NewChat() {
  const navigate = useNavigate();

  const handleSendChat = async (value: string) => {
    navigate({
      to: "/c/$chatId",
      params: {
        chatId: value.toLowerCase().slice(0, 10).replaceAll(" ", "-"),
      },
    });
  };

  return (
    <div className="flex flex-col bg-background/90 h-full">
      <h1 className="flex-1 mt-10 font-bold text-foreground text-2xl sm:text-4xl text-center">
        What can I help you ship?
      </h1>

      <div className="space-y-4 mx-auto mb-4 w-full max-w-[calc(100%-2rem)]">
        <ResourceToolbar />

        {/* Chat input */}
        <ChatBox onSubmit={handleSendChat} />
      </div>
    </div>
  );
}
