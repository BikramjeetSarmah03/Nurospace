import { createFileRoute } from "@tanstack/react-router";

import TopBar from "@/features/workflow/components/editor/topbar/top-bar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";
import { workflowService } from "@/features/workflow/services/workflow.service";

export const Route = createFileRoute(
  "/_protected/w/$workflowId/runs/$executionId",
)({
  component: ExecutionViewer,
});

function ExecutionViewer() {
  const { workflowId, executionId } = Route.useParams();

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <TopBar
        workflowId={workflowId}
        title="Workflow run details"
        subTitle={`Run Id: ${executionId}`}
        hideButtons
      />

      <section className="flex h-full overflow-auto">
        <ExecutionViewerWrapper executionId={executionId} />
      </section>
    </div>
  );
}

function ExecutionViewerWrapper({ executionId }: { executionId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: [WORKFLOW_KEYS.EXECUTION, executionId],
    queryFn: async () => {
      const data =
        await workflowService.getExecutionDetailsWithPhases(executionId);
      return data.success ? data.data : null;
    },
  });

  return (
    <div>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  );
}
