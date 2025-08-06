import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth.query";

import { useAuthStore } from "@/hooks/use-auth";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
  loader: async ({ location, context }) => {
    const session = await context.queryClient.ensureQueryData(
      authQueries.userSessionOptions(),
    );

    if (!session.data?.session || !session.data?.session) {
      throw redirect({
        to: "/auth/login",
        throw: true,
        replace: true,

        search: {
          redirect: location.href,
        },
      });
    }

    useAuthStore.getState().setUser(session.data.user || null);

    return {
      user: session.data.user,
      session: session.data.session,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full">
        <div className="flex bg-white px-4 py-2 border-b">
          <SidebarTrigger />
        </div>

        <Outlet />
      </main>
    </SidebarProvider>
  );
}
