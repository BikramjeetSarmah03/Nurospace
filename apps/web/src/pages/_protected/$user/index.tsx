import { createFileRoute } from "@tanstack/react-router";

import ProjectPage from "@/features/projects/pages/project";

export const Route = createFileRoute("/_protected/$user/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectPage />;
}
