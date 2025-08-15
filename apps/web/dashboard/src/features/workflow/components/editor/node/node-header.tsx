import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { CoinsIcon, CopyIcon, GripVerticalIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TaskRegistry } from "@/features/workflow/components/registry/task/registery";
import type { TaskType } from "@/features/workflow/lib/constants/task";
import { CreateFlowNode } from "@/features/workflow/lib/create-flow-node";
import type { AppNode } from "@/features/workflow/types/app-node";

interface NodeHeaderProps {
  taskType: TaskType;
  nodeId: string;
}

export default function NodeHeader({ taskType, nodeId }: NodeHeaderProps) {
  const task = TaskRegistry[taskType];
  const { deleteElements, getNode, addNodes } = useReactFlow();

  // const handleDuplicate = useCallback(() => {
  //   const node = getNode(nodeId) as AppNode;
  //   const newX = node.position.x;
  //   const newY = node.position.y + (node?.measured?.height || 0) + 20;
  //   const newNode = CreateFlowNode(node.data.type, {
  //     x: newX,
  //     y: newY,
  //   });
  //   setNodes([newNode]);
  // }, [getNode, nodeId, setNodes]);

  const handleDuplicate = useCallback(() => {
    const node = getNode(nodeId) as AppNode;

    // Calculate the new position
    const newX = Math.floor(Math.random() * 200 * 2) - 100;

    const newY = node.position.y + (node.measured?.height || 0) + 20;

    // Create the new node at the random position
    const newNode = CreateFlowNode(node.data.type, {
      x: newX,
      y: newY,
    });

    // Add the new node
    addNodes([newNode]);
  }, [getNode, nodeId, addNodes]);

  return (
    <div className="flex items-center gap-2 p-2">
      <task.icon size={18} />

      <div className="flex justify-between items-center w-full">
        <p className="font-bold text-muted-foreground text-xs uppercase">
          {task.label}
        </p>

        <div className="flex items-center gap-1">
          {task.isEntryPoint && <Badge>Entry Point</Badge>}

          <Badge className="flex items-center gap-2 text-xs">
            <CoinsIcon size={16} />
            TODO
          </Badge>

          {!task.isEntryPoint && (
            <>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="hover:bg-red-100 text-red-500"
                onClick={() => {
                  deleteElements({
                    nodes: [{ id: nodeId }],
                  });
                }}
              >
                <TrashIcon size={12} />
              </Button>

              <Button variant={"ghost"} size={"icon"} onClick={handleDuplicate}>
                <CopyIcon size={12} />
              </Button>
            </>
          )}

          <Button
            variant={"ghost"}
            size={"icon"}
            className="cursor-grab drag-handle"
          >
            <GripVerticalIcon size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
