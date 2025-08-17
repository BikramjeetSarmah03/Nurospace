import { createFileRoute } from "@tanstack/react-router";

import { UpdateChatPage } from "@/features/chat/pages/update-chat";

export const Route = createFileRoute("/_protected/c/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateChatPage />;
}
