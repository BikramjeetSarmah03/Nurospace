import { TASK_TYPE } from "@/features/workflow/lib/constants/task";
import { GlobeIcon, type LucideProps } from "lucide-react";

export const LaunchBrowserTask = {
  type: TASK_TYPE.LAUNCH_BROWSER,
  label: "Launch Browser",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
};
