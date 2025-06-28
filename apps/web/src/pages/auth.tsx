import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  loader: async () => {
    const user = await authClient.getSession();

    if (user.data) {
      redirect({ to: "/dashboard", throw: true, replace: true });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
