import type { Node } from "@xyflow/react";

import type { TaskParam, TaskType } from "./task";

export interface IAppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  [key: string]: unknown;
}

export interface AppNode extends Node {
  data: IAppNodeData;
}

export interface ParamProps {
  param: TaskParam;
  value: string;
  updateNodeParamValue: (newValue: string) => void;
  disabled?: boolean;
}

export type AppNodeMissingInput = {
  nodeId: string;
  inputs: string[];
};
