import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/c/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/c/$slug"!</div>;
}
