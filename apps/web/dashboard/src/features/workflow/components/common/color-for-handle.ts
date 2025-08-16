import { TASK_PARAM_TYPES, type TaskParamType } from "../../types/task";

export const ColorForHandle: Record<TaskParamType, string> = {
  [TASK_PARAM_TYPES.BROWSER_INSTANCE]: "!bg-sky-400",
  STRING: "!bg-amber-400",
};
