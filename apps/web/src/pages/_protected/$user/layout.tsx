import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/$user")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
