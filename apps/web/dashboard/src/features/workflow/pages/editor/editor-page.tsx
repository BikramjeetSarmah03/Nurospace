import { ReactFlowProvider } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import { FlowValidationContextProvider } from "@/features/workflow/context/flow-validation-context";
import { workflowService } from "@/features/workflow/services/workflow.service";
import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";

import TopBar from "@/features/workflow/components/editor/topbar/top-bar";
import FlowEditor from "@/features/workflow/components/editor/flow-editor";
import TaskMenu from "@/features/workflow/components/editor/task-menu";

interface EditorPageProps {
  slug: string;
}

export default function EditorPage({ slug }: EditorPageProps) {
  const { data: workflowData, isLoading } = useQuery({
    queryKey: [WORKFLOW_KEYS.SINGLE_WORKFLOW, slug],
    enabled: !!slug,
    queryFn: async () => await workflowService.getSingleWorkflow(slug),
  });

  const workflow = workflowData?.success ? workflowData.data : null;

  return (
    <FlowValidationContextProvider>
      <ReactFlowProvider>
        <div className="flex flex-col size-full overflow-hidden">
          <TopBar
            title="Workflow Editor"
            subTitle="Really long name for workflow..."
            workflowId={slug}
          />

          <section className="flex h-full overflow-auto">
            {isLoading ? (
              <div className="place-items-center grid w-full">
                <Loader2Icon className="size-6 animate-spin" />
              </div>
            ) : workflow === null ? (
              <div className="place-items-center grid w-full">
                <h1 className="text-xl">{workflowData?.message}</h1>
              </div>
            ) : (
              <FlowEditor workflow={workflow} />
            )}

            <TaskMenu />
          </section>
        </div>
      </ReactFlowProvider>
    </FlowValidationContextProvider>
  );
}
