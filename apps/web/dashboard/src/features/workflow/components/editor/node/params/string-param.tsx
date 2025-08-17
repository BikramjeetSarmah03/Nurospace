import { useEffect, useId, useState } from "react";

import type { ParamProps } from "@/features/workflow/types/app-node";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StringParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: ParamProps) {
  const [internalValue, setInternalValue] = useState(value);
  const id = useId();

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  let Component: typeof Input | typeof Textarea = Input;
  if (param.variant === "textarea") {
    Component = Textarea;
  }

  return (
    <div className="space-y-1 p-1 w-full">
      <Label htmlFor={id} className="flex text-xs">
        {param.name}
        {param.required && <p className="font-semibold text-red-400">*</p>}
      </Label>

      <Component
        id={id}
        className="bg-white text-xs placeholder:text-xs"
        value={internalValue}
        placeholder="Enter value here"
        onChange={(e) => setInternalValue(e.target.value)}
        onBlur={(e) => updateNodeParamValue(e.target.value)}
        disabled={disabled}
      />
      {param.helperText && (
        <p className="text-muted-foreground text-xs">{param.helperText}</p>
      )}
    </div>
  );
}
