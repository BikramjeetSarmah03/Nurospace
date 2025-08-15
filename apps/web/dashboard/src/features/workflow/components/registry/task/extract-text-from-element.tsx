import { TextIcon, type LucideProps } from "lucide-react";

import {
  TASK_PARAM_TYPES,
  TASK_TYPE,
} from "@/features/workflow/lib/constants/task";
import type { TaskRegistryType } from "@/features/workflow/types/task";

export const ExtractTextFromElement: TaskRegistryType = {
  type: TASK_TYPE.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Extract text from element",
  icon: (props: LucideProps) => (
    <TextIcon className="stroke-pink-400" {...props} />
  ),
  inputs: [
    {
      name: "Html",
      type: TASK_PARAM_TYPES.STRING,
      required: true,
      variant: "textarea",
    },
    {
      name: "Selector",
      type: TASK_PARAM_TYPES.STRING,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Extracted text",
      type: TASK_PARAM_TYPES.STRING,
    },
  ],
};
