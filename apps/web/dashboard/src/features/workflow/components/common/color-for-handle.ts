import { TaskParamType } from "@packages/workflow/types/task.ts";

export const ColorForHandle: Record<TaskParamType, string> = {
  [TaskParamType.BROWSER_INSTANCE]: "!bg-sky-400",
  STRING: "!bg-amber-400",
};
