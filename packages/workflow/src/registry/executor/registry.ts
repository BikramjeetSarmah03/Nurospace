import type { TaskType } from "../../types";
import type { ExecutionEnvironment } from "../../types/executor";
import { LaunchBrowserExecutor } from "./launch-browser";

type IRegistry = {
  [K in TaskType]: (environment: ExecutionEnvironment<any>) => Promise<boolean>;
};

export const ExecutorRegistry: IRegistry = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: () => Promise.resolve(true),
  PAGE_TO_HTML: () => Promise.resolve(true),
};
