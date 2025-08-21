import { TaskRegistry } from "../registry/task/registry";
import type { AppNode } from "../types";

export function CalculateWorkflowCost(nodes: AppNode[]) {
  return nodes.reduce((acc, node) => {
    return acc + TaskRegistry[node.data.type].credits;
  }, 0);
}
