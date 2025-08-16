import type { AppNode } from "@/features/workflow/types/app-node";
import type { TaskType } from "./constants/task";

export function CreateFlowNode(
  nodeType: TaskType,
  position?: { x: number; y: number },
): AppNode {
  return {
    id: crypto.randomUUID(),
    type: "Node",
    dragHandle: ".drag-handle",
    data: {
      type: nodeType,
      inputs: {},
    },
    position: position ?? { x: 0, y: 0 },
  };
}
