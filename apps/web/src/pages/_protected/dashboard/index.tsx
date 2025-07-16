import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background h-full">Hello "/_protected/$user/"!</div>
  );
}
