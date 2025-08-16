import type { IWorkflowTask, TaskType } from "../../types";
import { ExtractTextFromElement } from "./extract-text-from-element";
import { LaunchBrowserTask } from "./launch-browser";
import { PageToHtmlTask } from "./page-to-html";

type IRegistry = {
  [K in TaskType]: IWorkflowTask & { type: K };
};

export const TaskRegistry: IRegistry = {
  LAUNCH_BROWSER: LaunchBrowserTask,
  PAGE_TO_HTML: PageToHtmlTask,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElement,
};
