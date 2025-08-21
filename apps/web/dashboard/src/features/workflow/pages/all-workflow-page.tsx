import { EllipsisVerticalIcon, HardDriveIcon, PlusIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import CreateWorkflow from "@/features/workflow/components/modals/create-workflow";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/query-client";

import type { IWorkflow } from "@packages/workflow/types/workflow.ts";
import { workflowService } from "../services/workflow.service";
import { WORKFLOW_KEYS } from "../lib/query-keys";
import type { SuccessResponse } from "@/config/types";
import { Badge } from "@/components/ui/badge";

export default function AllWorkflowPage({
  workflows,
}: {
  workflows: IWorkflow[];
}) {
  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const data = await workflowService.deleteWorkflow(id);

      if (!data.success) throw new Error(data.message);

      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.setQueryData(
        [WORKFLOW_KEYS.ALL_WORKFLOW],
        (old: SuccessResponse<IWorkflow[]> | undefined) => {
          if (!old) return [];
          return {
            success: true,
            data: old?.data?.filter((workflow) => workflow.id !== id),
          };
        },
      );
      toast.success("Workflow deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="space-y-2">
      {workflows.length > 0 ? (
        workflows.map((workflow, i) => (
          <div
            key={i.toString()}
            className="relative flex justify-between items-center bg-sidebar hover:shadow-md p-2 border rounded-md cursor-pointer"
          >
            <Link
              to="/w/$workflowId"
              params={{
                workflowId: workflow.id,
              }}
              className="w-full"
            >
              {workflow.name}
            </Link>

            <Badge
              variant={"outline"}
              className={cn(
                "mx-4",
                workflow.status === "DRAFT" ? "bg-yellow-400" : "bg-green-400",
              )}
            >
              {workflow.status}
            </Badge>

            <ConfirmDialog
              description={
                <>
                  If you are sure, Enter <b>{workflow.name}</b> to confirm
                </>
              }
              form={<Input />}
              confirmLabel="Delete"
              onConfirm={() => deleteWorkflow.mutate(workflow.id)}
            >
              <EllipsisVerticalIcon />
            </ConfirmDialog>

            {/* Progress bar */}
            <div
              className={cn("bottom-0 left-0 absolute bg-green-500 w-0 h-1")}
              style={{
                width: (Math.floor(Math.random() * (100 - 20 + 1)) + 20) * 5,
              }}
            />
          </div>
        ))
      ) : (
        <div className="place-items-center gap-2 grid">
          <div className="bg-primary/20 hover:bg-primary/40 p-2.5 rounded-full w-fit h-fit transition-all duration-300">
            <HardDriveIcon size={24} />
          </div>

          <div className="space-y-1 text-center">
            <h1 className="font-semibold text-xl">No Workflow created yet!</h1>
            <p className="text-sm">
              Click the button below to create your first workflow
            </p>

            <CreateWorkflow className="mt-2">
              <Button size={"sm"} className="w-full">
                <PlusIcon />
                Create Workflow
              </Button>
            </CreateWorkflow>
          </div>
        </div>
      )}
    </div>
  );
}
