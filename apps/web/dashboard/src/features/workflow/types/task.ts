import type { LucideProps } from "lucide-react";

import type { TaskParam, TaskType } from "../lib/constants/task";

export interface IWorkflowTask {
  type: TaskType;
  label: string;
  icon: React.FC<LucideProps>;
  isEntryPoint?: boolean;
  inputs?: TaskParam[];
  outputs?: TaskParam[];
  credits: number;
}
