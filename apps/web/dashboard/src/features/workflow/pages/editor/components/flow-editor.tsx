import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TASK_TYPE } from "@/features/workflow/lib/constants/task";
import { CreateFlowNode } from "@/features/workflow/lib/create-flow-node";

export default function FlowEditor() {
  const [nodes, _setNodes, onNodesChange] = useNodesState([
    CreateFlowNode(TASK_TYPE.LAUNCH_BROWSER),
  ]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <main className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls position="top-left" />

        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}
