import type { ParamProps } from "@packages/workflow/types/app-node.ts";

export function BrowserInstanceParam({
  param,
  updateNodeParamValue,
  value,
}: ParamProps) {
  console.log({ updateNodeParamValue });
  console.log({ value });
  return <p className="text-xs">{param.name}</p>;
}
