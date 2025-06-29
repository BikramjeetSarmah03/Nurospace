import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import Navbar from "@/components/common/navbar";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
  loader: async () => {
    const user = await authClient.getSession();

    if (!user.data || user.error) {
      redirect({ to: "/auth/login", throw: true, replace: true });
    }
  },
});

function RouteComponent() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 h-full">
      <Navbar />
      <Outlet />
    </div>
  );
}
