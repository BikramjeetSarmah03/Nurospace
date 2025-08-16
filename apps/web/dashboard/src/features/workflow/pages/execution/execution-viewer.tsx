import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import {
  IWorkflowExecutionStatus,
  type IWorkflowExecution,
} from "@packages/workflow/types/workflow.js";

import { WORKFLOW_KEYS } from "../../lib/query-keys";
import { workflowService } from "../../services/workflow.service";
import {
  CalendarIcon,
  CircleDashedIcon,
  ClockIcon,
  CoinsIcon,
  Loader2Icon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatesToDurationString } from "@/lib/helpers/date";
import { GetPhasesTotalCost } from "@/lib/helpers/phases";
import Loader from "@/components/common/loader";

interface ExecutionViewerProps {
  execution: IWorkflowExecution;
}

export default function ExecutionViewer({ execution }: ExecutionViewerProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [WORKFLOW_KEYS.EXECUTION, execution.id],
    queryFn: async () => {
      return await workflowService.getExecutionDetailsWithPhases(execution.id);
    },
    initialData: execution,
    refetchInterval: (q) =>
      q.state.data?.status === IWorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  const phaseDetails = useQuery({
    queryKey: [WORKFLOW_KEYS.PHASE_DETAILS, selectedPhase],
    enabled: !!selectedPhase,
    queryFn: () => workflowService.getPhaseDetails(selectedPhase ?? ""),
  });

  const isRunning = query.data?.status === IWorkflowExecutionStatus.RUNNING;

  const duration = DatesToDurationString(
    query.data?.completedAt,
    query.data?.startedAt,
  );

  const creditsConsumed = GetPhasesTotalCost(query.data.phases || []);

  return (
    <div className="flex size-full">
      <aside className="flex flex-col bg-white border-r-2 w-[440px] min-w-[440px] max-w-[400px] overflow-hidden border-separate grow">
        <div className="px-2 py-4">
          {/* status label */}
          <ExecutionLabel
            icon={CircleDashedIcon}
            label="Status"
            value={query.data?.status}
          />

          {/* started at label */}
          <ExecutionLabel
            icon={CalendarIcon}
            label="Started At"
            value={
              <span className="lowercase">
                {query.data?.startedAt
                  ? formatDistanceToNow(new Date(query.data?.startedAt), {
                      addSuffix: true,
                    })
                  : "-"}
              </span>
            }
          />

          <ExecutionLabel
            icon={ClockIcon}
            label="Duration"
            value={
              duration ? (
                duration
              ) : (
                <Loader2Icon className="animate-spin" size={20} />
              )
            }
          />
          <ExecutionLabel
            icon={CoinsIcon}
            label="Credits Consumed"
            value={creditsConsumed}
          />

          <Separator />

          <div className="flex justify-center items-center px-4 py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <WorkflowIcon size={20} className="stroke-muted-foreground/80" />
              <span className="font-semibold">Phases</span>
            </div>
          </div>

          <Separator />

          <div className="px-2 py-4 h-full overflow-auto">
            {query.data?.phases.map((phase, idx) => (
              <Button
                key={phase.id + idx.toString()}
                className="justify-between w-full"
                variant={selectedPhase === phase.id ? "secondary" : "ghost"}
                onClick={() => {
                  if (isRunning) return;
                  setSelectedPhase(phase.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={"outline"}>{idx + 1}</Badge>
                  <p className="font-semibold">{phase.name}</p>
                </div>

                <span className="text-muted-foreground">{phase.status}</span>
              </Button>
            ))}
          </div>
        </div>
      </aside>

      <div>
        {phaseDetails.isLoading ? (
          <Loader />
        ) : (
          <pre>{JSON.stringify(phaseDetails.data, null, 4)}</pre>
        )}
      </div>
    </div>
  );
}

function ExecutionLabel({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="flex justify-between items-center px-4 py-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={20} className="stroke-muted-foreground/80" />
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-2 font-semibold capitalize">
        {value}
      </div>
    </div>
  );
}
