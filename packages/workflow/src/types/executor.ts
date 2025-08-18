import type { Browser, Page } from "puppeteer";
import type { IWorkflowTask } from "./workflow";
import type { LogCollector } from "./log";

export type Environment = {
  browser?: Browser;
  page?: Page;
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
  setOutput(name: T["outputs"][number]["name"], value: string): void;

  getBrowser(): Browser | undefined;
  setBrowser(browser: Browser): void;

  getPage(): Page | undefined;
  setPage(page: Page): void;

  log: LogCollector;
};
