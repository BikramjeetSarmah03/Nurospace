import { useReactFlow } from "@xyflow/react";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { workflowService } from "@/features/workflow/services/workflow.service";
import { queryClient } from "@/lib/query-client";
import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";

interface SaveBtnProps {
  workflowId: string;
}

export function SaveBtn({ workflowId }: SaveBtnProps) {
  const { toObject } = useReactFlow();

  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      defination,
    }: {
      id: string;
      defination: string;
    }) => {
      const data = await workflowService.updateWorkflow({
        id,
        defination,
      });

      if (!data.success) throw Error(data.message);

      return data;
    },
    onSuccess: (data) => {
      toast.success("Flow Saved Successfully", { id: "save-workflow" });
      queryClient.setQueryData(
        [WORKFLOW_KEYS.SINGLE_WORKFLOW, workflowId],
        data,
      );
    },
    onError: (err) => {
      toast.error(err.message, { id: "save-workflow" });
    },
  });

  return (
    <Button
      disabled={saveMutation.isPending}
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={() => {
        const workflowDefination = JSON.stringify(toObject());
        toast.loading("Saving wokflow...", { id: "save-workflow" });
        saveMutation.mutate({
          id: workflowId,
          defination: workflowDefination,
        });
      }}
    >
      <CheckIcon size={18} className="stroke-green-400" />
      Save
    </Button>
  );
}
