import { Handle, Position, useEdges } from "@xyflow/react";

import type { TaskParam } from "@packages/workflow/types/task.ts";
import { useFlowValidation } from "@/features/workflow/hooks/use-flow-validation";
import { ColorForHandle } from "@/features/workflow/components/common/color-for-handle";

import { cn } from "@/lib/utils";

import NodeParamField from "./node-param-field";

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
  const { invalidInputs } = useFlowValidation();
  const edges = useEdges();
  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name,
  );
  const hasErrors = invalidInputs
    .find((node) => node.nodeId === nodeId)
    ?.inputs.find((invalidInput) => invalidInput === input.name);

  return (
    <div
      className={cn(
        "relative flex justify-start bg-secondary p-3 w-full",

        hasErrors && "bg-destructive/20",
      )}
    >
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
