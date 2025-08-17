import type { Browser } from "puppeteer";
import type { IWorkflowTask } from "./workflow";

export type Environment = {
  browser?: Browser;
  phases: Record<
    string, // nodeId/phaseId
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
};

export type ExecutionEnvironment<T extends IWorkflowTask> = {
  getInput(name: T["inputs"][number]["name"]): string;
};
