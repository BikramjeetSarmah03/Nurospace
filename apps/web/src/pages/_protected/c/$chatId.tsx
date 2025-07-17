import ChatPage from "@/features/chats/pages/chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/c/$chatId")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return <ChatPage slug={params.chatId} />;
}
