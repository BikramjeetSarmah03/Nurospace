import { useQuery } from "@tanstack/react-query";
import { WORKFLOW_KEYS } from "../../lib/query-keys";
import { workflowService } from "../../services/workflow.service";
import Loader from "@/components/common/loader";
import { CoinsIcon, InboxIcon } from "lucide-react";
import type { IWorkflowExecution } from "@packages/workflow/types/workflow.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatesToDurationString } from "@/lib/helpers/date";
import { Badge } from "@/components/ui/badge";
import { ExecutionStatus } from "./_components/execution-status";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";

export default function AllExecutionsPage({
  workflowId,
}: {
  workflowId: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: [WORKFLOW_KEYS.ALL_EXECUTIONS, workflowId],
    queryFn: async () => await workflowService.getAllExecutions(workflowId),
    enabled: !!workflowId,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (data?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-4 h-40">
        <div className="bg-primary/20 my-4 p-3 rounded-full w-fit">
          <InboxIcon className="stroke-primary" />
        </div>

        <h1 className="font-semibold text-lg">
          No runs have been triggered yet for this workflow.
        </h1>
        <p className="text-muted-foreground">
          You can trigger a new run in the editor page
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 lg:p-6 w-full lg:container">
      <ExecutionTable workflowId={workflowId} initialData={data || []} />
    </div>
  );
}

type InitialDataType = Awaited<IWorkflowExecution[]>;

function ExecutionTable({
  workflowId,
  initialData,
}: {
  workflowId: string;
  initialData: InitialDataType;
}) {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: [WORKFLOW_KEYS.ALL_EXECUTIONS, workflowId],
    queryFn: async () => await workflowService.getAllExecutions(workflowId),
    enabled: !!workflowId,
    initialData,
    refetchInterval: 5 * 1000, // 5 sec
  });

  return (
    <div className="bg-sidebar shadow-md border rounded-lg overflow-auto">
      <Table className="h-full">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Consumed</TableHead>
            <TableHead className="text-muted-foreground text-xs text-right">
              Startred at (desc)
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="gap-2 h-full overflow-auto">
          {data.map((exec) => {
            const duration = DatesToDurationString(
              exec.completedAt,
              exec.startedAt,
            );
            const formattedStartedAt =
              exec.startedAt &&
              formatDistanceToNow(exec.startedAt, {
                addSuffix: true,
              });

            return (
              <TableRow
                key={exec.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate({
                    to: "/w/$workflowId/runs/$executionId",
                    params: {
                      executionId: exec.id,
                      workflowId: workflowId,
                    },
                  })
                }
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{exec.id}</span>
                    <div className="text-muted-foreground text-xs">
                      <span>Triggered via</span>
                      <Badge variant={"outline"}>{exec.trigger}</Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <ExecutionStatus status={exec.status} />
                      <span className="font-semibold capitalize">
                        {exec.status}
                      </span>
                    </div>
                    <div className="mx-5 text-muted-foreground text-xs">
                      {duration}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CoinsIcon size={16} className="text-primary" />
                      <span className="font-semibold capitalize">
                        {exec.creditsConsumed}
                      </span>
                    </div>
                    <div className="mx-5 text-muted-foreground text-xs">
                      Credits
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground text-right">
                  {formattedStartedAt}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
