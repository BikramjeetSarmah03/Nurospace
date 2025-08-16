import { Handle, Position } from "@xyflow/react";

import type { TaskParam } from "@packages/workflow/types/task.ts";

import { cn } from "@/lib/utils";
import { ColorForHandle } from "../../common/color-for-handle";

interface NodeOutputsProps {
  children: React.ReactNode;
}

interface NodeOutputProps {
  output: TaskParam;
}

export function NodeOutputs({ children }: NodeOutputsProps) {
  return <div className="flex flex-col gap-1 divide-y">{children}</div>;
}

export function NodeOutput({ output }: NodeOutputProps) {
  return (
    <div className="relative flex justify-end bg-secondary p-3 w-full">
      <p className="text-muted-foreground text-xs"> {output.name}</p>

      <Handle
        id={output.name}
        type="source"
        position={Position.Right}
        className={cn(
          "!bg-muted-foreground !border-2 !border-background !size-4",
          ColorForHandle[output.type],
        )}
      />
    </div>
  );
}
