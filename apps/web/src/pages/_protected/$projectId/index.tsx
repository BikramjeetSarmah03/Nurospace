import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/$projectId/"!</div>;
}
