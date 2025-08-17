import type { ParamProps } from "@/features/workflow/types/app-node";

export function BrowserInstanceParam({
  param,
  _updateNodeParamValue,
  _value,
}: ParamProps) {
  return <p className="text-xs">{param.name}</p>;
}
