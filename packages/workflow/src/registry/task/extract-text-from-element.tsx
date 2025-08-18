import { TextIcon, type LucideProps } from "lucide-react";

import { TaskParamType, TaskType, type IWorkflowTask } from "../../types";

export const ExtractTextFromElement = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Extract text from element",
  icon: (props: LucideProps) => (
    <TextIcon className="stroke-pink-400" {...props} />
  ),
  inputs: [
    {
      name: "Html",
      type: TaskParamType.STRING,
      required: true,
      variant: "textarea",
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "Extracted text",
      type: TaskParamType.STRING,
    },
  ] as const,
  credits: 3,
} satisfies IWorkflowTask;
