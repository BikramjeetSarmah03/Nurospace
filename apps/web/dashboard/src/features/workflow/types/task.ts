import type { LucideProps } from "lucide-react";
import type { TaskParam, TaskType } from "../lib/constants/task";

export interface TaskRegistryType {
  type: TaskType;
  label: string;
  icon: (props: LucideProps) => React.ReactNode;
  isEntryPoint?: boolean;
  inputs?: TaskParam[];
  outputs?: TaskParam[];
}
