import type { LucideProps } from "lucide-react";

import type { TaskParam, TaskType } from "./task";
import type { AppNode } from "./app-node";

export enum IWorkflowExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum IExecutionPhaseStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum IFlowToExecutionPlanValidationError {
  NO_ENTRY_POINT = "NO_ENTRY_POINT",
  INVALID_INPUTS = "INVALID_INPUTS",
}

export enum WorkflowExecutionTrigger {
  MANUAL = "MANUAL",
}

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
