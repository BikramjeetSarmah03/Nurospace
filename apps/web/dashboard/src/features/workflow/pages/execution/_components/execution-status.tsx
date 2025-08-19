import { cn } from "@/lib/utils";
import type { IWorkflowExecutionStatus } from "@packages/workflow/types/workflow.js";

const indicatorColors: Record<IWorkflowExecutionStatus, string> = {
  PENDING: "bg-slate-400",
  RUNNING: "bg-yellow-400",
  FAILED: "bg-red-400",
  COMPLETED: "bg-emerald-600",
};

export function ExecutionStatus({
  status,
}: {
  status: IWorkflowExecutionStatus;
}) {
  return <div className={cn("rounded-full size-2", indicatorColors[status])} />;
}
