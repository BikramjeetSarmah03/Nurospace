import { GlobeIcon, type LucideProps } from "lucide-react";

import {
  TASK_PARAM_TYPES,
  TASK_TYPE,
} from "@/features/workflow/lib/constants/task";
import type { TaskRegistryType } from "@/features/workflow/types/task";

export const PageToHtmlTask: TaskRegistryType = {
  type: TASK_TYPE.PAGE_TO_HTML,
  label: "Get html from page",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
  inputs: [
    {
      name: "Website Url",
      type: TASK_PARAM_TYPES.BROWSER_INSTANCE,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Html",
      type: TASK_PARAM_TYPES.STRING,
    },
    {
      name: "Web Page",
      type: TASK_PARAM_TYPES.BROWSER_INSTANCE,
    },
  ],
};
