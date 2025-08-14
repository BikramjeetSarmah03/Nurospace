import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type FitViewOptions,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";

import type { IWorkflow } from "@/features/workflow/types/workflow";

import NodeComponent from "./node/node-component";

interface FlowEditorProps {
  workflow: IWorkflow;
}

const nodeTypes: NodeTypes = {
  Node: NodeComponent,
};

// const snapGrid: [number, number] = [50, 50];
const fitViewOptions: FitViewOptions = { padding: 1 };

export default function FlowEditor({ workflow }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport } = useReactFlow();

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow?.defination || "{}");
      if (!flow) return;

      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);

      if (!flow.viewport) return;

      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({ x, y, zoom });
    } catch (error) {
      console.log({ error });
    }
  }, [workflow.defination, setEdges, setNodes, setViewport]);

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
