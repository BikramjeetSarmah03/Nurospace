import type { ParamProps } from "@/features/workflow/types/app-node";

export function BrowserInstanceParam({
  param,
  updateNodeParamValue,
  value,
}: ParamProps) {
  return <p className="text-xs">{param.name}</p>;
}
