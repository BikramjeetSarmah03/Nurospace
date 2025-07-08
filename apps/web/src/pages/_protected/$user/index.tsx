import { createFileRoute } from "@tanstack/react-router";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

import ProjectPage from "@/features/projects/pages/project";

import { useWorkspaceStore } from "@/hooks/use-workspace";
import { useSidebar } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_protected/$user/")({
  component: RouteComponent,
});

function RouteComponent() {
  const workspace = useWorkspaceStore((state) =>
    state.workspaces.find((w) => w.id === state.activeWorkspaceId),
  );
  const { toggleSidebar, open: openSidebar } = useSidebar();

  return (
    <section className="flex flex-col bg-white w-full h-full">
      <div className="top-0 z-10 sticky flex justify-between items-center bg-white shadow-md p-4 w-full">
        <button
          type="button"
          onClick={() => toggleSidebar()}
          className="cursor-pointer"
        >
          {openSidebar ? <PanelLeftIcon /> : <PanelRightIcon />}
        </button>

        <h1>{workspace?.name ?? "Loading..."}</h1>

        <button type="button">Personalities</button>
      </div>

      <ProjectPage />
    </section>
  );
}
