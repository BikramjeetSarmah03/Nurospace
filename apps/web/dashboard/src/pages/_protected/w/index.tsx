import { createFileRoute } from "@tanstack/react-router";

import AllWorkflowPage from "@/features/workflow/pages/all-workflow-page";

export const Route = createFileRoute("/_protected/w/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AllWorkflowPage />;
}
