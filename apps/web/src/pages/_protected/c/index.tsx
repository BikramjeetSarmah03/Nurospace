import { createFileRoute } from "@tanstack/react-router";

import NewChatPage from "@/features/chats/pages/new-chat";

export const Route = createFileRoute("/_protected/c/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NewChatPage />;
}
