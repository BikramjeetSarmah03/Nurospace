import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useState } from "react";

import type { AppNodeMissingInput } from "@packages/workflow/types/app-node.ts";

type FlowValidationContextType = {
  invalidInputs: AppNodeMissingInput[];
  setInvalidInputs: Dispatch<SetStateAction<AppNodeMissingInput[]>>;
  clearErrors: () => void;
};

export const FlowValidationContext =
  createContext<FlowValidationContextType | null>(null);

export function FlowValidationContextProvider({ children }: PropsWithChildren) {
  const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInput[]>([]);

  const clearErrors = () => {
    setInvalidInputs([]);
  };

  const value: FlowValidationContextType = {
    invalidInputs,
    setInvalidInputs,
    clearErrors,
  };

  return (
    <FlowValidationContext.Provider value={value}>
      {children}
    </FlowValidationContext.Provider>
  );
}
