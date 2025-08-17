import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import type { ModelConfig } from "@/types";

export const googleModels: Record<string, ModelConfig> = {
  "gemini-pro": {
    key: "gemini-pro",
    provider: "google",
    model: "gemini-pro",
    temperature: 0.7,
    maxTokens: 8192,
    description: "Google Gemini Pro model",
    apiKeyEnv: "GOOGLE_API_KEY",
  },
  "gemini-flash": {
    key: "gemini-flash",
    provider: "google",
    model: "gemini-pro-vision", // or whatever model name Gemini Flash uses
    temperature: 0.5,
    maxTokens: 4096,
    description: "Faster, cheaper Gemini Flash model",
    apiKeyEnv: "GOOGLE_API_KEY",
  },
};

export const google = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  streaming: true,
});
