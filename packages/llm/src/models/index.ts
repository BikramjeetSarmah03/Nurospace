// packages/llm/src/config/model.ts

// import { openaiModels } from "./openai";
import { googleModels } from "./google";
import type { ModelConfig } from "@/types";

// Combine all models here
export const modelRegistry: Record<string, ModelConfig> = {
  //   ...openaiModels,
  ...googleModels,
};

export function getModelConfig(key: string): ModelConfig | undefined {
  return modelRegistry[key];
}

export function getAllModels(): ModelConfig[] {
  return Object.values(modelRegistry);
}
