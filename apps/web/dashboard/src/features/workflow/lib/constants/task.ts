export const TASK_TYPE = {
  LAUNCH_BROWSER: "LAUNCH_BROWSER",
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];
