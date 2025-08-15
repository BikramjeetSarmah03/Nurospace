import { GlobeIcon, type LucideProps } from "lucide-react";

import {
  TASK_PARAM_TYPES,
  TASK_TYPE,
} from "@/features/workflow/lib/constants/task";
import type { IWorkflowTask } from "@/features/workflow/types/task";

export const LaunchBrowserTask = {
  type: TASK_TYPE.LAUNCH_BROWSER,
  label: "Launch Browser",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
  inputs: [
    {
      name: "Website Url",
      type: TASK_PARAM_TYPES.STRING,
      helperText: "eg: https://www.google.com",
      required: true,
      hideHandle: true,
    },
  ],
  outputs: [
    {
      name: "Web page",
      type: TASK_PARAM_TYPES.BROWSER_INSTANCE,
    },
  ],
  credits: 5,
} satisfies IWorkflowTask;
