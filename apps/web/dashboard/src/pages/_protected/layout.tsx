import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth.query";

import { useAuthStore } from "@/hooks/use-auth";

import Header from "@/components/common/header";

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
  const loaderData = Route.useLoaderData();

  return (
    <div>
      <Header user={loaderData.user} />

      <Outlet />
    </div>
  );
}
