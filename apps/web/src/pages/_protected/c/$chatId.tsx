import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/c/$chatId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/c/$chatId"!</div>;
}
