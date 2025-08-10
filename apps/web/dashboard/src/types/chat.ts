import type { ReactNode } from "react";

export interface CommandSuggestion {
  icon: ReactNode;
  label: string;
  description: string;
  prefix: string;
}
