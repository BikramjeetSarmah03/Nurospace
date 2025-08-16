import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useExecutionPlan } from "@/features/workflow/hooks/use-execution-plan";

interface ExecuteBtnProps {
  workflowId: string;
}

export function ExecuteBtn({ workflowId }: ExecuteBtnProps) {
  const generate = useExecutionPlan();

  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => {
        const plan = generate();
        console.log("----plan----");
        console.table(plan);
      }}
    >
      <PlayIcon size={18} />
      Execute
    </Button>
  );
}
