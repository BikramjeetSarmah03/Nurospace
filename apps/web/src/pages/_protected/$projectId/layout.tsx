import ProjectLayout from "@/features/projects/components/layout/project-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProjectLayout>
      <Outlet />
    </ProjectLayout>
  );
}
