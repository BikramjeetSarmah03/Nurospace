import { Handle, Position, useEdges } from "@xyflow/react";

import type { TaskParam } from "@/features/workflow/lib/constants/task";

import { cn } from "@/lib/utils";

import NodeParamField from "./node-param-field";
import { ColorForHandle } from "../../common/color-for-handle";

interface NodeInputsProps {
  children: React.ReactNode;
}

interface NodeInputProps {
  input: TaskParam;
  nodeId: string;
}

export function NodeInputs({ children }: NodeInputsProps) {
  return <div className="flex flex-col gap-2 divide-y">{children}</div>;
}

export function NodeInput({ input, nodeId }: NodeInputProps) {
  const edges = useEdges();
  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name,
  );

  return (
    <div className="relative flex justify-start bg-secondary p-3 w-full">
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />

      {!input.hideHandle && (
        <Handle
          id={input.name}
          type="target"
          position={Position.Left}
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !size-4",
            ColorForHandle[input.type],
          )}
          isConnectable={!isConnected}
        />
      )}
    </div>
  );
}
