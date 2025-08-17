import type { NodeProps } from "@xyflow/react";
import { memo } from "react";

import type { AppNodeData } from "@/features/workflow/types/app-node";
import { TaskRegistry } from "@/features/workflow/components/registry/task/registery";

import NodeCard from "./node-card";
import NodeHeader from "./node-header";
import { NodeInput, NodeInputs } from "./node-inputs";
import { NodeOutput, NodeOutputs } from "./node-outputs";

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;

  const task = TaskRegistry[nodeData.type];

  return (
    <NodeCard nodeId={props.id} isSelected={!!props.selected}>
      <NodeHeader taskType={nodeData.type} />

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
