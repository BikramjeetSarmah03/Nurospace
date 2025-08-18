/** biome-ignore-all lint/style/noNonNullAssertion: <its okay bikram is controlling this> */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  IWorkflowExecutionStatus,
  type IWorkflowExecution,
} from "@packages/workflow/types/workflow.ts";

import { WORKFLOW_KEYS } from "../../lib/query-keys";
import { workflowService } from "../../services/workflow.service";

import ExecutionSidebar from "./_components/execution-sidebar";
import PhaseDetails from "./_components/phase-details";

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

  useEffect(() => {
    // while running we auto-select current running phase in the sidebar
    const phases = query.data?.phases || [];

    if (isRunning) {
      // select the last executed phase
      const phaseToSelect = phases
        .slice() // clone so we don’t mutate original
        .sort((a, b) =>
          new Date(a.startedAt!) > new Date(b.startedAt!) ? -1 : 1,
        )[0];

      setSelectedPhase(phaseToSelect.id);
      return;
    }

    const phaseToSelect = phases
      .slice() // clone so we don’t mutate original
      .sort((a, b) =>
        new Date(a.completedAt!) > new Date(b.completedAt!) ? -1 : 1,
      )[0];

    setSelectedPhase(phaseToSelect?.id);
  }, [query.data.phases, isRunning]);

  return (
    <div className="flex size-full">
      <ExecutionSidebar
        query={query.data}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
      />

      <div className="flex size-full overflow-x-auto">
        {isRunning && (
          <div className="flex flex-col justify-center items-center gap-2 size-full">
            <p className="font-bold">Run is in progress, please wait</p>
          </div>
        )}

        {!isRunning && !selectedPhase && (
          <div className="flex flex-col justify-center items-center gap-2 size-full">
            <div className="flex-col gap-1 text-center">
              <p className="font-bold">No Phase selected</p>
              <p className="text-muted-foreground text-xs">
                Select a phase to view details
              </p>
            </div>
          </div>
        )}

        {!isRunning && selectedPhase && phaseDetails.data && (
          <PhaseDetails phaseDetails={phaseDetails.data} />
        )}
      </div>
    </div>
  );
}
