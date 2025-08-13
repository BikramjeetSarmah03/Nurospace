import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/w/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/w/$slug"!</div>;
}
