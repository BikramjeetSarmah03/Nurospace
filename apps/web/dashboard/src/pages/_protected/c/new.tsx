import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

// import AnimatedAIChat from "@/components/mvpblocks/animated-ai-chat";
import ChatBox from "@/components/chat/chat-box";
import ChatMessages from "@/components/chat/chat-messages";
import { useState } from "react";
import { chatService } from "@/services/chat/chat.service";
import { queryClient } from "@/lib/query-client";
import { CHAT_QUERY } from "@/config/query-keys/chat";

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
  const navigate = useNavigate();

  const handleSendChat = async (value: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setLoading(true);

    let _assistantReply = "hi";

    const res = await chatService.chat({
      chatId: null,
      msg: value,
    });

    if (!res.success) throw new Error(res.message);

    queryClient.invalidateQueries({
      queryKey: [CHAT_QUERY.CHATS],
    });

    navigate({
      to: "/c/$slug",
      params: {
        slug: res.data.slug,
      },
    });

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

      <ChatBox onSubmit={handleSendChat} />
    </div>
  );
}
