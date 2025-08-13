import type { TaskType } from "@/config/constants/task";
import type { Node } from "@xyflow/react";

export interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  [key: string]: unknown;
}

export interface AppNode extends Node {
  data: AppNodeData;
}
