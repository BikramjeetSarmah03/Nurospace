import { useContext } from "react";

import { FlowValidationContext } from "@/features/workflow/context/flow-validation-context";

export function useFlowValidation() {
  const context = useContext(FlowValidationContext);

  if (!context) {
    throw new Error(
      "useFlowValidation must be withing a FlowValidationContext",
    );
  }

  return context;
}
