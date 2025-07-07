import { ChevronsUpDown, GalleryVerticalEnd, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";

import { useWorkspaceModal } from "@/hooks/use-workspace-modal";

import type { SuccessResponse } from "@productify/shared/types";

import { useWorkspaceStore } from "@/hooks/use-workspace";

import { WORKSPACE_KEYS } from "@/config/querykeys";
import { LOCALSTORAGE_KEYS } from "@/config/constants";

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();

  const workspaceModal = useWorkspaceModal();
  const workspace = useWorkspaceStore();

  const handleDeleteWorkspace = async (id: string) => {
    try {
      const project = (await (
        await apiClient.projects[":projectId"].$delete({
          param: {
            projectId: id,
          },
        })
      ).json()) as SuccessResponse;

      if (project.success) {
        if (id === workspace.activeWorkspaceId) {
          const remainingProjects =
            workspace.workspaces.filter((p) => p.id !== id) || [];

          if (remainingProjects.length > 0) {
            const firstProject = remainingProjects[0];
            localStorage.setItem(LOCALSTORAGE_KEYS.WORKSPACE, firstProject.id);
            workspace.setActiveWorkspace(firstProject.id);
          } else {
            localStorage.removeItem(LOCALSTORAGE_KEYS.WORKSPACE);
            workspace.setActiveWorkspace("");
          }
        }

        queryClient.invalidateQueries({
          queryKey: [WORKSPACE_KEYS.ALL],
        });

        toast.success("Workspace Deleted Successfully");
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleActiveWorkspace = (projectId: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.WORKSPACE, projectId);
    workspace.setActiveWorkspace(projectId);
  };

  const activeProject = workspace.workspaces?.find(
    (project) => project.id === workspace.activeWorkspaceId,
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-medium truncate">
                  {activeProject?.name ?? "Select Project"}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {workspace.workspaces.length ?? 0} projects
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Projects
            </DropdownMenuLabel>

            {workspace.workspaces?.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleActiveWorkspace(project.id)}
                className={cn(
                  "group justify-between gap-2 p-2 hover:bg-gray-300 cursor-pointer",
                  workspace.activeWorkspaceId === project.id && "bg-gray-200",
                )}
              >
                <span className="w-full truncate">{project.name}</span>
                <Button
                  variant={"ghost"}
                  type="button"
                  className="bg-red-400 hover:bg-red-500 p-1 size-8 text-white"
                  size={"sm"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkspace(project.id);
                  }}
                >
                  <Trash2 className="!size-3 text-white hover:text-destructive" />
                </Button>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                workspaceModal.onOpen();
              }}
            >
              <div className="flex justify-center items-center bg-transparent border rounded-md size-6">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                New Project
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
