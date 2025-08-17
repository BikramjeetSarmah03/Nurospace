import type { IWorkflowTask, TaskType } from "../../types";
import type { ExecutionEnvironment } from "../../types/executor";

import { LaunchBrowserExecutor } from "./launch-browser";
import { PageToHtmlExecutor } from "./page-to-html";

type ExecutorFn<T extends IWorkflowTask> = (
  environment: ExecutionEnvironment<T>,
) => Promise<boolean>;

type IRegistry = {
  [K in TaskType]: ExecutorFn<IWorkflowTask & { type: K }>;
};

export const ExecutorRegistry: IRegistry = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: () => Promise.resolve(true),
};
