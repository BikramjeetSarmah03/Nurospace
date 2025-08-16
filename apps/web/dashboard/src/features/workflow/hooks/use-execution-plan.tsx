import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  FlowToExecutionPlan,
  type IExecutionErrorType,
} from "../lib/execution-plan";

import type { AppNode } from "@/features/workflow/types/app-node";
import { FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR } from "@/features/workflow/types/workflow";

import { useFlowValidation } from "./use-flow-validation";

const useExecutionPlan = () => {
  const { toObject } = useReactFlow();

  const { setInvalidInputs, clearErrors } = useFlowValidation();

  const handleError = useCallback(
    (error: IExecutionErrorType) => {
      switch (error.type) {
        case FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR.NO_ENTRY_POINT:
          toast.error("No entry point found");
          break;
        case FLOW_TO_EXECUTION_PLAN_VALIDATION_ERROR.INVALID_INPUTS:
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
