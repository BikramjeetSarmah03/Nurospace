import { createFileRoute } from "@tanstack/react-router";

import type { SuccessResponse } from "@productify/types";

import { apiClient } from "@/lib/api-client";

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

  return (
    <div>
      <div className="p-4 border">Api Status: {apiStatus.message}</div>
    </div>
  );
}
