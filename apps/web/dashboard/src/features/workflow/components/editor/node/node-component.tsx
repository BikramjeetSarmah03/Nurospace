import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { env } from "@packages/env/client";

import type { IAppNodeData } from "@packages/workflow/types/app-node.ts";
import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";

import { Badge } from "@/components/ui/badge";

import NodeCard from "./node-card";
import NodeHeader from "./node-header";
import { NodeInput, NodeInputs } from "./node-inputs";
import { NodeOutput, NodeOutputs } from "./node-outputs";

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as IAppNodeData;

  const task = TaskRegistry[nodeData.type];

  return (
    <NodeCard nodeId={props.id} isSelected={!!props.selected}>
      {env.VITE_DEV_MODE && (
        <Badge className="rounded-none rounded-t w-full">DEV: {props.id}</Badge>
      )}
      <NodeHeader taskType={nodeData.type} nodeId={props.id} />

      <NodeInputs>
        {task?.inputs?.map((input) => (
          <NodeInput input={input} key={input.name} nodeId={props.id} />
        ))}
      </NodeInputs>

      <NodeOutputs>
        {task?.outputs?.map((output) => (
          <NodeOutput output={output} key={output.name} />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
