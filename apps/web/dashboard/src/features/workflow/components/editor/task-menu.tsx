import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

import { TaskType } from "@packages/workflow/types/task.ts";

import { cn } from "@/lib/utils";

export default function TaskMenu() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcut({
    shortcuts: [
      ["ctrl", "k"],
      ["meta", "k"],
    ],
    onKeyPressed: toggleOpen,
  });

  function toggleOpen() {
    setOpen((prev) => !prev);
  }

  return (
    <aside
      className={cn(
        "bg-white border-l-2 h-full overflow-auto border-separate",
        "relative overflow-hidden",
        "transition-[width] duration-300",
        open ? "w-[340px]" : "w-10",
      )}
    >
      <div className={cn("p-2 px-4", open && "border-b")}>
        <button
          type="button"
          className={cn(
            "top-0 left-0 absolute bg-gray-200 p-2 border cursor-pointer",
            open && "p-2.5",
          )}
          onClick={toggleOpen}
        >
          <ChevronRightIcon
            className={cn(!open ? "rotate-180" : "")}
            size={18}
          />
        </button>

        {open && <h1 className="text-center">Tasks Menu</h1>}
      </div>

      <div className="px-4">
        {open && (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={["extraction"]}
          >
            <AccordionItem value="extraction">
              <AccordionTrigger className="font-bold">
                Data extraction
              </AccordionTrigger>

              <AccordionContent className="flex flex-col gap-1">
                {Object.values(TaskType).map((type) => (
                  <TaskMenuBtn taskType={type} key={type} />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </aside>
  );
}

function TaskMenuBtn({ taskType }: { taskType: TaskType }) {
  const task = TaskRegistry[taskType];

  const onDargStart = (event: React.DragEvent, type: TaskType) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Button
      variant={"secondary"}
      className="flex justify-between items-center gap-2 border w-full"
      draggable
      onDragStart={(event) => onDargStart(event, taskType)}
    >
      <div className="flex items-center gap-2">
        <task.icon size={20} />
        {task.label}
      </div>
    </Button>
  );
}
