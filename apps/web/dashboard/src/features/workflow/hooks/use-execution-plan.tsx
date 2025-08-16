import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  FlowToExecutionPlan,
  type IExecutionErrorType,
} from "@packages/workflow/lib/execution-plan.ts";

import type { AppNode } from "@packages/workflow/types/app-node.ts";
import { IFlowToExecutionPlanValidationError } from "@packages/workflow/types/workflow.ts";

import { useFlowValidation } from "./use-flow-validation";

const useExecutionPlan = () => {
  const { toObject } = useReactFlow();

  const { setInvalidInputs, clearErrors } = useFlowValidation();

  const handleError = useCallback(
    (error: IExecutionErrorType) => {
      switch (error.type) {
        case IFlowToExecutionPlanValidationError.NO_ENTRY_POINT:
          toast.error("No entry point found");
          break;
        case IFlowToExecutionPlanValidationError.INVALID_INPUTS:
          toast.error("Not all inputs values are set");
          setInvalidInputs(error?.invalidElements || []);
          break;
        default:
          toast.error("Somthing went wrong");
          break;
      }
    },
    [setInvalidInputs],
  );

  const generateExecutionPlan = useCallback(() => {
    const { nodes, edges } = toObject();

    const { executionPlan, error } = FlowToExecutionPlan(
      nodes as AppNode[],
      edges,
    );

    if (error) {
      handleError(error);
      return null;
    }

    clearErrors();
    return executionPlan;
  }, [toObject, handleError, clearErrors]);

  return generateExecutionPlan;
};

export { useExecutionPlan };
