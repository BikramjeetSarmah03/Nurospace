import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type FitViewOptions,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TASK_TYPE } from "@/features/workflow/lib/constants/task";
import { CreateFlowNode } from "@/features/workflow/lib/create-flow-node";
import NodeComponent from "./node/node-component";

const nodeTypes: NodeTypes = {
  Node: NodeComponent,
};

// const snapGrid: [number, number] = [50, 50];
const fitViewOptions: FitViewOptions = { padding: 1 };

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
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        // snapToGrid={true} // it will be snappy
        // snapGrid={snapGrid}
      >
        <Controls position="top-left" fitViewOptions={fitViewOptions} />

        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}
