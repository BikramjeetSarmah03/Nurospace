import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskRegistry } from "@/features/workflow/components/registry/task/registery";
import type { TaskType } from "@/features/workflow/lib/constants/task";
import { CoinsIcon, GripVerticalIcon } from "lucide-react";

interface NodeHeaderProps {
  taskType: TaskType;
}

export default function NodeHeader({ taskType }: NodeHeaderProps) {
  const task = TaskRegistry[taskType];

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
