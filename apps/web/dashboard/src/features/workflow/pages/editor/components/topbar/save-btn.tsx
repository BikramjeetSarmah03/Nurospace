import { useReactFlow } from "@xyflow/react";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

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
      toast.success(`ID: ${id}`);
      toast.success(`Desc: ${defination}`);
      return {
        success: true,
      };
    },
    onSuccess: () => {
      toast.success("Flow Saved Successfully", { id: "save-workflow" });
    },
    onError: () => {
      toast.success("Something went wrong", { id: "save-workflow" });
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
