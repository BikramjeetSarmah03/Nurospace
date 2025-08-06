import { authQueries } from "@/queries/auth.query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      authQueries.userSessionOptions(),
    );

    if (session.data?.session || session.data?.session) {
      throw redirect({
        to: "/",
        replace: true,
        throw: true,
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
