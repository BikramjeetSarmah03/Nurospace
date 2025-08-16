import type { LucideProps } from "lucide-react";
import { createEnum } from "@/lib/utils";

import type { TaskParam, TaskType } from "./task";
import type { AppNode } from "./app-node";

const workflowStatus = createEnum(["DRAFT", "PUBLISHED"] as const);
export const WORKFLOW_STATUS = workflowStatus.object;
export type IWorkflowStatus = (typeof workflowStatus.values)[number];

const flowToExecutionPlanValidationError = createEnum([
  "NO_ENTRY_POINT",
  "INVALID_INPUTS",
] as const);
export const FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR =
  flowToExecutionPlanValidationError.object;
export type IFlowToExecutionPlanValidationError =
  (typeof flowToExecutionPlanValidationError.values)[number];

export interface IWorkflowTask {
  type: TaskType;
  label: string;
  icon: React.FC<LucideProps>;
  isEntryPoint?: boolean;
  inputs?: TaskParam[];
  outputs?: TaskParam[];
  credits: number;
}

export type IWorkflow = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string | null;
  defination?: string | null;
  execuationPlan?: string | null;
  oron?: string | null;
  status: string;
  creditCost?: number | null;
  lastRunId?: string | null;
  lastRunStatus?: string | null;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type IWorkflowExecutionPlanPhase = {
  phase: number;
  nodes: AppNode[];
};

export type IWorkflowExecutionPlan = IWorkflowExecutionPlanPhase[];
