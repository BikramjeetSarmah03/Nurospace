import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/c/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/c/new"!</div>;
}
