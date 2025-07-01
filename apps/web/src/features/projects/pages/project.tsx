import { useState } from "react";
import ChatBox from "@/features/projects/components/chat-box";

export default function ProjectPage() {
  const [chat, setChat] = useState("");

  const handleSendChat = (value: string) => {
    setChat(value);
  };

  return (
    <section className="flex flex-col justify-center items-center space-y-4 p-4 w-full">
      <div className="flex justify-between items-center bg-white p-4 border rounded-md w-full">
        <h1> {"PROJECT NAME"}</h1>

        <button type="button">Personalities</button>
      </div>

      <div className="flex flex-col flex-1 justify-end space-y-4 w-full h-full">
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
      </div>
    </section>
  );
}
