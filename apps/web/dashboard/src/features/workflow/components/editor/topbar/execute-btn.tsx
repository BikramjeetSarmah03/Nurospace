import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { WORKFLOW_KEYS } from "@/features/workflow/lib/query-keys";

import { queryClient } from "@/lib/query-client";

interface ExecuteBtnProps {
  workflowId: string;
}

export function ExecuteBtn({ workflowId }: ExecuteBtnProps) {
  const executeMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return [];
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
      disabled={executeMutation.isPending}
      className="flex items-center gap-2"
      onClick={() => {
        executeMutation.mutate({
          id: workflowId,
        });
      }}
    >
      <PlayIcon size={18} />
      Execute
    </Button>
  );
}
