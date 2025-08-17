import { createFileRoute } from "@tanstack/react-router";

import TopBar from "@/features/workflow/components/editor/topbar/top-bar";
import { useSuspenseQuery } from "@tanstack/react-query";

import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";
import { workflowService } from "@/features/workflow/services/workflow.service";

import ExecutionViewer from "@/features/workflow/pages/execution/execution-viewer";

export const Route = createFileRoute(
  "/_protected/w/$workflowId/runs/$executionId",
)({
  component: ExecutionViewerWrapper,
});

function ExecutionViewerWrapper() {
  const { workflowId, executionId } = Route.useParams();

  const execution = useSuspenseQuery({
    queryKey: [WORKFLOW_KEYS.EXECUTION, executionId],
    queryFn: async () => {
      return await workflowService.getExecutionDetailsWithPhases(executionId);
    },
  });

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <TopBar
        workflowId={workflowId}
        title="Workflow run details"
        subTitle={`Run Id: ${executionId}`}
        hideButtons
      />

      <section className="flex h-full overflow-auto">
        <ExecutionViewer execution={execution.data} />
      </section>
    </div>
  );
}
