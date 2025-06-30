import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import ChatBox from "@/components/project/chat-box";

export const Route = createFileRoute("/_protected/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [chat, setChat] = useState("");

  const handleSendChat = (value: string) => {
    setChat(value);
  };

  return (
    <div className="flex h-full">
      <aside className="bg-white shadow p-4 border-r w-40 md:w-80">
        Sidebar
      </aside>

      <section className="flex flex-col justify-center items-center space-y-4 p-4 w-full">
        {!chat && (
          <h1 className="font-bold text-foreground text-2xl sm:text-4xl text-center">
            What can I help you ship?
          </h1>
        )}
        {chat && (
          <div className="flex-1 bg-white p-4 border rounded-md w-full">
            {chat}
          </div>
        )}

        <ChatBox onSubmit={handleSendChat} />
      </section>

      <aside className="bg-white shadow p-4 border-l w-60 md:w-[40rem]">
        Context
      </aside>
    </div>
  );
}
