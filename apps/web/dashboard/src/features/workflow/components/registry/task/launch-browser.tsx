import { GlobeIcon, type LucideProps } from "lucide-react";

import {
  TASK_PARAM_TYPES,
  TASK_TYPE,
  type TaskParam,
  type TaskType,
} from "@/features/workflow/lib/constants/task";

interface TaskRegistryType {
  type: TaskType;
  label: string;
  icon: (props: LucideProps) => React.ReactNode;
  isEntryPoint?: boolean;
  inputs?: TaskParam[];
}

export const LaunchBrowserTask: TaskRegistryType = {
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
};
