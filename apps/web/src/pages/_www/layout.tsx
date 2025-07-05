import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_www")({
  component: RouteComponent,
  loader: async () => {
    const user = await authClient.getSession();

    if (user.data) {
      redirect({ to: "/auth/login", throw: true, replace: true });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
