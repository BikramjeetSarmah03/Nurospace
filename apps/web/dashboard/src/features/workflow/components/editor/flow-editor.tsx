import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Connection,
  type FitViewOptions,
  type NodeTypes,
  type EdgeTypes,
  getOutgoers,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";

import type { IWorkflow } from "@packages/workflow/types/workflow.ts";
import type { TaskType } from "@packages/workflow/types/task.ts";
import type { AppNode } from "@packages/workflow/types/app-node.ts";

import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";
import { CreateFlowNode } from "@packages/workflow/lib/create-flow-node.ts";

import NodeComponent from "./node/node-component";

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
  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();

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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const taskType = event.dataTransfer.getData("application/reactflow");
      if (!taskType || typeof taskType === "undefined") return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = CreateFlowNode(taskType as TaskType, position);
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
            },
          },
          eds,
        ),
      );

      if (!connection.targetHandle) return;

      // remove input value if present on connection
      const node = nodes.find((nd) => nd.id === connection.target);

      if (!node) return;

      const nodeInputs = node.data.inputs;
      updateNodeData(node.id, {
        inputs: {
          ...nodeInputs,
          [connection.targetHandle]: "",
        },
      });
    },
    [setEdges, updateNodeData, nodes],
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // no self connection allowed
      if (connection.source === connection.target) return false;

      // same taskParam type connection
      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);

      if (!source || !target) {
        console.log("Source and Target node not found");
        return false;
      }

      const sourceTask = TaskRegistry[source.data.type];
      const targetTask = TaskRegistry[target.data.type];

      const output = sourceTask.outputs?.find(
        (o) => o.name === connection.sourceHandle,
      );
      const input = targetTask.inputs?.find(
        (o) => o.name === connection.targetHandle,
      );

      if (input?.type !== output?.type) {
        console.log("Invalid connection: type mismatch");
        return false;
      }

      // cycles shall not allowed
      const hasCycle = (node: AppNode, visited = new Set()) => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;

          if (hasCycle(outgoer, visited)) return true;
        }
      };

      const deletedCycle = hasCycle(target);

      // return true if valid connection
      return !deletedCycle;
    },
    [nodes, edges],
  );

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
        isValidConnection={isValidConnection}
        // snapToGrid={true} // it will be snappy
        // snapGrid={snapGrid}
      >
        <Controls position="top-left" fitViewOptions={fitViewOptions} />

        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </main>
  );
}
