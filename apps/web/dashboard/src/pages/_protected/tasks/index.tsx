import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/tasks/"!</div>;
}
