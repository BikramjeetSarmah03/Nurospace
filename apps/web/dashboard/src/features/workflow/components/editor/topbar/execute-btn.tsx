import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useExecutionPlan } from "@/features/workflow/hooks/use-execution-plan";
import { useMutation } from "@tanstack/react-query";
import { workflowService } from "@/features/workflow/services/workflow.service";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";

interface ExecuteBtnProps {
  workflowId: string;
}

export function ExecuteBtn({ workflowId }: ExecuteBtnProps) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationFn: async (body: {
      workflowId: string;
      flowDefination: string;
    }) => {
      const data = await workflowService.runWorkflow(body);

      console.log({ data });

      if (!data.success) throw new Error(data.message);

      return data.data;
    },
    onSuccess: () => {
      toast.success("Execution started: ", { id: "flow-execution" });
    },
    onError: () => {
      toast.error("Something went wrong", { id: "flow-execution" });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate();

        if (!plan) return;

        mutation.mutate({
          workflowId,
          flowDefination: JSON.stringify(toObject()),
        });
        console.log("----plan----");
        console.table(plan);
      }}
    >
      <PlayIcon size={18} />
      Execute
    </Button>
  );
}
