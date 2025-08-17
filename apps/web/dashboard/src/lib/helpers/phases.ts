import type { IWorkflowExecutionPhase } from "@packages/workflow/types/workflow.ts";

type Phase = Pick<IWorkflowExecutionPhase, "creditsConsumed">;

export function GetPhasesTotalCost(phases: Phase[]) {
  return phases.reduceRight(
    (acc, phase) => acc + (phase.creditsConsumed || 0),
    0,
  );
}
