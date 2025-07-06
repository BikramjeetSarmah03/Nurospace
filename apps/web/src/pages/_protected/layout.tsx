import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useWorkspaceModal } from "@/hooks/use-workspace-modal";

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
  const workspaceModal = useWorkspaceModal();

  const { isLoading, data: projects } = useQuery({
    queryKey: ["PROJECTS"],
    queryFn: async () => {
      return (await apiClient.projects.$get()).json();
    },
  });

  useEffect(() => {
    if (!isLoading && projects && projects.data.length === 0) {
      workspaceModal.onOpen();
    }
  }, [isLoading, projects, workspaceModal.onOpen]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
