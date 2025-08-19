import { createFileRoute } from "@tanstack/react-router";

import TopBar from "@/features/workflow/components/editor/topbar/top-bar";
import AllExecutionsPage from "@/features/workflow/pages/execution/all-executions-page";

export const Route = createFileRoute("/_protected/w/$workflowId/runs/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { workflowId } = Route.useParams();

  return (
    <div className="flex flex-col size-full overflow-hidden">
      <TopBar
        title="Workflow Editor"
        subTitle="Really long name for workflow..."
        workflowId={workflowId}
        hideButtons
      />

      <AllExecutionsPage workflowId={workflowId} />
    </div>
  );
}
