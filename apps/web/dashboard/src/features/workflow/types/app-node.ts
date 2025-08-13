import type { Node } from "@xyflow/react";

import type { TaskType } from "../lib/constants/task";

export interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  [key: string]: unknown;
}

export interface AppNode extends Node {
  data: AppNodeData;
}
