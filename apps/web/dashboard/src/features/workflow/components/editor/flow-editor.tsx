import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Connection,
  type FitViewOptions,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";

import type { IWorkflow } from "@/features/workflow/types/workflow";

import NodeComponent from "./node/node-component";

import { CreateFlowNode } from "../../lib/create-flow-node";
import type { TaskType } from "../../lib/constants/task";
import type { AppNode } from "../../types/app-node";
import DeletableEdge from "./edge/deletable-edge";

interface FlowEditorProps {
  workflow: IWorkflow;
}

const nodeTypes: NodeTypes = {
  Node: NodeComponent,
};

const edgeTypes: EdgeTypes = {
  default: DeletableEdge,
};

// const snapGrid: [number, number] = [50, 50];
const fitViewOptions: FitViewOptions = { padding: 1 };

export default function FlowEditor({ workflow }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { setViewport, screenToFlowPosition } = useReactFlow();

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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const taskType = event.dataTransfer.getData("application/reactflow");
    if (!taskType || typeof taskType === "undefined") return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = CreateFlowNode(taskType as TaskType, position);
    setNodes((nds) => nds.concat(newNode));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          animated: false,
          markerEnd: {
            type: MarkerType.Arrow,
          },
        },
        eds,
      ),
    );
  }, []);

  return (
    <main className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}
        // snapToGrid={true} // it will be snappy
        // snapGrid={snapGrid}
      >
        <Controls position="top-left" fitViewOptions={fitViewOptions} />

        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}
