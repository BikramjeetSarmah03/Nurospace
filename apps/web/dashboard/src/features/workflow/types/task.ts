import { createEnum } from "@/lib/utils";

// Task types
const taskType = createEnum([
  "LAUNCH_BROWSER",
  "PAGE_TO_HTML",
  "EXTRACT_TEXT_FROM_ELEMENT",
] as const);
export const TASK_TYPE = taskType.object;
export type TaskType = (typeof taskType.values)[number];

// Task param types
const taskParamTypes = createEnum(["STRING", "BROWSER_INSTANCE"] as const);
export const TASK_PARAM_TYPES = taskParamTypes.object;
export type TaskParamType = (typeof taskParamTypes.values)[number];

export interface TaskParam {
  name: string;
  type: TaskParamType;
  helperText?: string;
  required?: boolean;
  hideHandle?: boolean;
  [key: string]: unknown;
  variant?: string;
}
