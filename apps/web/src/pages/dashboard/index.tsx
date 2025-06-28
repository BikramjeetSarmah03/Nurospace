import { createFileRoute } from "@tanstack/react-router";

import type { SuccessResponse } from "@productify/types";

import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  loader: async () => {
    const response = await apiClient.api.v1.status.$get();

    if (!response.ok) {
      throw new Error("Failed to fetch API status");
    }

    return { apiStatus: (await response.json()) as SuccessResponse };
  },
});

function RouteComponent() {
  const { apiStatus } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const handleLogout = () => {
    authClient.signOut().then(() => {
      navigate({ to: "/auth/login", replace: true });
    });
  };

  return (
    <div>
      <h1>Hello "/dashboard/"!</h1>

      <Button onClick={handleLogout}>Logout</Button>

      <ModeToggle />

      <div className="p-4 border">Api Status: {apiStatus.message}</div>
    </div>
  );
}
