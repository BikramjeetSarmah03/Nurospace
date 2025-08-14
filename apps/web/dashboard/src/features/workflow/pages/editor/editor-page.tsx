import { ReactFlowProvider } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import FlowEditor from "./components/flow-editor";
import TopBar from "./components/topbar/top-bar";

import { WORKFLOW_KEYS } from "../../lib/query-keys";
import { workflowService } from "../../services/workflow.service";

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
        </section>
      </div>
    </ReactFlowProvider>
  );
}
