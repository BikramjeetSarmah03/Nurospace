import { CodeIcon, type LucideProps } from "lucide-react";

import {
  TASK_PARAM_TYPES,
  TASK_TYPE,
} from "@/features/workflow/lib/constants/task";
import type { IWorkflowTask } from "@/features/workflow/types/task";

export const PageToHtmlTask = {
  type: TASK_TYPE.PAGE_TO_HTML,
  label: "Get html from page",
  icon: (props: LucideProps) => (
    <CodeIcon className="stroke-pink-400" {...props} />
  ),
  inputs: [
    {
      name: "Web page",
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
  credits: 5,
} satisfies IWorkflowTask;
