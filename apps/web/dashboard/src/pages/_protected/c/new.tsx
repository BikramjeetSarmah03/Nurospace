import { createFileRoute } from "@tanstack/react-router";

import { ChatPage } from "@/features/chat/pages/chat-page";

export const Route = createFileRoute("/_protected/c/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatPage />;
}
