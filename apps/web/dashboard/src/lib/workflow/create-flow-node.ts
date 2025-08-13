import type { TaskType } from "@/config/constants/task";
import type { AppNode } from "@/types/app-node";

export function CreateFlowNode(
  nodeType: TaskType,
  position?: { x: number; y: number },
): AppNode {
  return {
    id: crypto.randomUUID(),
    data: {
      type: nodeType,
      inputs: {},
    },
    position: position ?? { x: 0, y: 0 },
  };
}
