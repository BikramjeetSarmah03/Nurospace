import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth.query";

import { useAuthStore } from "@/hooks/use-auth";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import TopNav from "@/components/sidebar/top-nav";

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

      <main className="flex flex-col bg-sidebar dark:bg-gray-900 w-full">
        <TopNav />

        <section className="flex-1 bg-accent">
          <Outlet />
        </section>
      </main>
    </SidebarProvider>
  );
}
