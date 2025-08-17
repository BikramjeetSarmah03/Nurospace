import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import {
  TASK_PARAM_TYPES,
  type TaskParam,
} from "@/features/workflow/lib/constants/task";

import type { AppNode } from "@/features/workflow/types/app-node";

import { StringParam } from "./params/string-param";
import { BrowserInstanceParam } from "./params/browser-instance-param";

interface NodeParamFieldProps {
  param: TaskParam;
  nodeId: string;
  disabled?: boolean;
}

export default function NodeParamField({
  param,
  nodeId,
  disabled,
}: NodeParamFieldProps) {
  const { updateNodeData, getNode } = useReactFlow();

  const node = getNode(nodeId) as AppNode;
  const value = node.data.inputs?.[param.name];

  const updateNodeParamValue = useCallback(
    (newValue: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...node?.data.inputs,
          [param.name]: newValue,
        },
      });
    },
    [nodeId, updateNodeData, param.name, node?.data.inputs],
  );

  switch (param.type) {
    case TASK_PARAM_TYPES.STRING:
      return (
        <StringParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
        />
      );

    case TASK_PARAM_TYPES.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParam
          param={param}
          value={""}
          updateNodeParamValue={updateNodeParamValue}
        />
      );

    default:
      return (
        <div className="w-full">
          <p className="text-muted-foreground text-xs">Not Implemented</p>
        </div>
      );
  }
}
