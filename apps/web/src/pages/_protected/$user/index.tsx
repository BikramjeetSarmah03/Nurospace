import { createFileRoute } from "@tanstack/react-router";

import ProjectPage from "@/features/projects/pages/project";

import { useWorkspaceStore } from "@/hooks/use-workspace";

export const Route = createFileRoute("/_protected/$user/")({
  component: RouteComponent,
});

function RouteComponent() {
  const workspace = useWorkspaceStore((state) =>
    state.workspaces.find((w) => w.id === state.activeWorkspaceId),
  );

  return (
    <section className="flex flex-col bg-white w-full h-full">
      <div className="flex justify-between items-center shadow-md p-4 w-full">
        <h1>{workspace?.name ?? "Loading..."}</h1>

        <button type="button">Personalities</button>
      </div>

      <ProjectPage />
    </section>
  );
}
