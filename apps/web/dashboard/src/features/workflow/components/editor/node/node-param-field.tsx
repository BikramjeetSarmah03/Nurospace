import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import {
  TaskParamType,
  type TaskParam,
} from "@packages/workflow/types/task.ts";
import type { AppNode } from "@packages/workflow/types/app-node.ts";

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
    case TaskParamType.STRING:
      return (
        <StringParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
        />
      );

    case TaskParamType.BROWSER_INSTANCE:
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
