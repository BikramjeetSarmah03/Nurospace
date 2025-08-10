import { createFileRoute } from "@tanstack/react-router";

// import AnimatedAIChat from "@/components/mvpblocks/animated-ai-chat";
import ChatBox from "@/components/chat/chat-box";
import ChatMessages from "@/components/chat/chat-messages";
import { useState } from "react";

export type IMessage = {
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/_protected/c/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      content: "Are you working ??",
      role: "user",
    },
    {
      content: "Hey its working",
      role: "assistant",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendChat = async (value: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setLoading(true);

    let _assistantReply = "hi";

    // const res = await apiClient.chat.$post({
    //   json: {
    //     message: value,
    //     slug,
    //   },
    // });

    // const reader = res.body?.getReader();
    // const decoder = new TextDecoder("utf-8");

    // while (true) {
    //   const readerVal = await reader?.read();
    //   if (readerVal?.done) break;

    //   const chunk = decoder.decode(readerVal?.value);
    //   _assistantReply += chunk;

    //   setMessages((prev) => {
    //     const updated = [...prev];
    //     const last = updated[updated.length - 1];
    //     if (last?.role === "assistant") {
    //       updated[updated.length - 1].content += chunk;
    //     } else {
    //       updated.push({ role: "assistant", content: chunk });
    //     }
    //     return [...updated];
    //   });
    // }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-8 mx-auto p-4 w-full max-w-4xl h-full">
      {/* <AnimatedAIChat /> */}

      <ChatMessages messages={messages} loading={loading} />

      <ChatBox />
    </div>
  );
}
