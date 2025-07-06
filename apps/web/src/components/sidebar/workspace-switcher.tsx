import * as React from "react";
import { ChevronsUpDown, Loader2Icon, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

import CreateWorkspaceDialog from "@/features/projects/components/dialogs/create-workspace";
import { apiClient } from "@/lib/api-client";

type Project = {
  id: string;
  name: string;
};

export function ProjectSwitcher() {
  const { isMobile } = useSidebar();
  const [modal, setModal] = React.useState(false);

  const { isLoading, data: projects } = useQuery({
    queryKey: ["PROJECTS"],
    queryFn: async () => {
      return (await apiClient.projects.$get()).json();
    },
  });

  const [activeProject, setActiveProject] = React.useState<Project | null>(
    null,
  );

  React.useEffect(() => {
    if (!isLoading && projects && projects.data.length === 0) {
      setModal(true);
    }
  }, [isLoading, projects]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex-1 grid text-sm text-left leading-tight">
                  <span className="font-medium truncate">
                    {activeProject?.name ?? "Select Project"}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    {projects?.data.length ?? 0} projects
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

              {isLoading ? (
                <div className="place-items-center grid h-20">
                  <Loader2Icon className="animate-spin" />
                </div>
              ) : (
                projects?.data?.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setActiveProject(project)}
                    className="group justify-between gap-2 p-2"
                  >
                    <span className="truncate">{project.name}</span>
                    <Trash2
                      className="size-4 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleDeleteProject(project.id);
                      }}
                    />
                  </DropdownMenuItem>
                ))
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => {
                  setModal(true);
                  // Trigger new project modal or logic here
                  // toast.info("Create new project");
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
      <CreateWorkspaceDialog open={modal} onOpenChange={setModal} />
    </>
  );
}
