import { formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";

import {
  CalendarIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  ClockIcon,
  CoinsIcon,
  Loader2Icon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GetPhasesTotalCost } from "@/lib/helpers/phases";
import {
  IExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  type IWorkflowExecution,
} from "@packages/workflow/types/workflow.ts";
import { DatesToDurationString } from "@/lib/helpers/date";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

interface ExecutionSidebarProps {
  query: IWorkflowExecution;
  selectedPhase: string | null;
  setSelectedPhase: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ExecutionSidebar({
  query,
  selectedPhase,
  setSelectedPhase,
}: ExecutionSidebarProps) {
  //   const [open, setOpen] = useState(false);

  //   useKeyboardShortcut({
  //     shortcuts: [
  //       ["ctrl", "k"],
  //       ["meta", "k"],
  //     ],
  //     onKeyPressed: toggleOpen,
  //   });

  //   function toggleOpen() {
  //     setOpen((prev) => !prev);
  //   }

  const isRunning = query?.status === IWorkflowExecutionStatus.RUNNING;

  const duration = DatesToDurationString(query?.completedAt, query?.startedAt);

  const creditsConsumed = GetPhasesTotalCost(query.phases || []);

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r-2 overflow-hidden border-separate",
        "w-[350px] min-w-[350px] max-w-[350px]",
        // "transition-all duration-300",
        // open ? "w-[440px]" : "w-10"
      )}
    >
      <div className="px-2 py-4">
        {/* status label */}
        <ExecutionLabel
          icon={CircleDashedIcon}
          label="Status"
          value={query?.status}
        />

        {/* started at label */}
        <ExecutionLabel
          icon={CalendarIcon}
          label="Started At"
          value={
            <span className="lowercase">
              {query?.startedAt
                ? formatDistanceToNow(new Date(query?.startedAt), {
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
          value={
            <CountUp
              duration={0.5}
              preserveValue
              end={creditsConsumed}
              decimal={"0"}
            />
          }
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
          {query?.phases.map((phase, idx) => (
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
                <p className="font-semibold text-xs">{phase.name}</p>
              </div>

              <PhaseStatusBadge status={phase.status} />
            </Button>
          ))}
        </div>
      </div>
    </aside>
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

function PhaseStatusBadge({ status }: { status: IExecutionPhaseStatus }) {
  switch (status) {
    case IExecutionPhaseStatus.PENDING:
      return <CircleDashedIcon size={20} className="stroke-muted-foreground" />;
    case IExecutionPhaseStatus.RUNNING:
      return (
        <Loader2Icon size={20} className="stroke-yellow-500 animate-spin" />
      );
    case IExecutionPhaseStatus.FAILED:
      return <CircleXIcon size={20} className="stroke-destructive" />;
    case IExecutionPhaseStatus.COMPLETED:
      return <CircleCheckIcon size={20} className="stroke-green-500" />;
    default:
      return <div className="rounded-full">{status}</div>;
  }
}
