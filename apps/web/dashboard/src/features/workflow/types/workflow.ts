import type { LucideProps } from "lucide-react";
import { createEnum } from "@/lib/utils";

import type { TaskParam, TaskType } from "./task";

const workflowStatus = createEnum([
  "LAUNCH_BROWSER",
  "PAGE_TO_HTML",
  "EXTRACT_TEXT_FROM_ELEMENT",
] as const);
export const WORKFLOW_STATUS = workflowStatus.object;
export type IWorkflowStatus = (typeof workflowStatus.values)[number];

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
