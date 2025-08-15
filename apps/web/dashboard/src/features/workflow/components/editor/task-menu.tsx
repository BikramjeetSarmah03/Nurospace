import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TASK_TYPE, type TaskType } from "../../lib/constants/task";
import { TaskRegistry } from "../registry/task/registery";
import { Button } from "@/components/ui/button";

export default function TaskMenu() {
  return (
    <aside className="bg-white p-2 px-4 border-l-2 w-[340px] min-w-[340px] max-w-[340px] h-full overflow-auto border-separate">
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
            {Object.values(TASK_TYPE).map((type) => (
              <TaskMenuBtn taskType={type} key={type} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
