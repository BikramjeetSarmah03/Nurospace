import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-heading";

import AllWorkflowPage from "@/features/workflow/pages/all-workflow-page";
import CreateWorkflow from "@/features/workflow/components/modals/create-workflow";
import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";
import { workflowService } from "@/features/workflow/services/workflow.service";

export const Route = createFileRoute("/_protected/w/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: [WORKFLOW_KEYS.ALL_WORKFLOW],
    queryFn: async () => await workflowService.getAllWorkflow(),
  });

  const workflows = workflowsData?.success ? workflowsData.data : [];

  return (
    <div className="space-y-4 p-4 h-full">
      <PageHeader
        title="Workflows"
        subTitle="Manage all your workflows"
        rightActions={
          <CreateWorkflow>
            <Button size={"sm"}>Create Workflow</Button>
          </CreateWorkflow>
        }
      />

      {isLoading ? (
        Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton
            className="flex justify-between items-center bg-gray-300 p-2 w-full h-10"
            key={idx.toString()}
          >
            <Skeleton className="bg-gray-200 w-32 h-full" />
            <Skeleton className="bg-gray-200 w-4 h-full" />
          </Skeleton>
        ))
      ) : (
        <AllWorkflowPage workflows={workflows} />
      )}
    </div>
  );
}
