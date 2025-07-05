import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
