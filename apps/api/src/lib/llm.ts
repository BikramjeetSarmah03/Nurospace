import env from "@packages/env/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const SupportedModels = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite-preview-06-17",
] as const;

export type ISupportedModels = (typeof SupportedModels)[number];

export const getLLM = (model: ISupportedModels = "gemini-2.5-pro") => {
  switch (model) {
    case "gemini-2.5-pro":
      return new ChatGoogleGenerativeAI({
        model: "gemini-2.5-pro",
        temperature: 0.7,
        apiKey: env.GOOGLE_API_KEY,
        streaming: true,
        maxRetries: 3,
        maxConcurrency: 1,
      });

    case "gemini-2.5-flash":
      return new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0.7,
        apiKey: env.GOOGLE_API_KEY,
        streaming: true,
        maxRetries: 3,
        maxConcurrency: 1,
      });

    default:
      throw new Error(`Unsupported model: ${model}`);
  }
};

// Fallback LLM for when primary model fails
export const getFallbackLLM = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: env.GOOGLE_API_KEY,
    streaming: true,
    maxRetries: 1,
    maxConcurrency: 1,
  });
};

// Function calling schema for tool selection (LangChain compatible)
export const ROUTING_FUNCTION_SCHEMA = {
  name: "route_task",
  description: "Route user query to appropriate agent with tool selection",
  parameters: {
    type: "object",
    properties: {
      agent: {
        type: "string",
        enum: ["research", "analysis", "execution", "planning"],
        description: "The agent type to route to",
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Confidence level in routing decision (0-1)",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of why this agent was chosen",
      },
      requiredTools: {
        type: "array",
        items: { type: "string" },
        description: "Specific tools needed for this task",
      },
      cacheKey: {
        type: "string",
        description: "Unique key for caching this routing decision",
      },
    },
    required: ["agent", "confidence", "reasoning", "requiredTools", "cacheKey"],
  },
};
