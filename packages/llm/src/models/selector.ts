// packages/llm/src/switcher/modelSwitcher.ts

import { getModelConfig } from "@/models";
import type { ModelConfig } from "@/types";

const aliasMap: Record<string, string> = {
  default: "gemini-pro",
  openai: "gpt-4-turbo",
  "openai-4.0": "gpt-4-turbo",
  "openai-3.5": "gpt-3.5",
  google: "gemini-pro",
  flash: "gemini-flash",
  claude: "claude-3-opus",
};

export function getModel(key: string): ModelConfig {
  const normalizedKey = aliasMap[key] || key;
  const config = getModelConfig(normalizedKey);

  if (!config) {
    throw new Error(`Model not found: ${key}`);
  }

  return config;
}
