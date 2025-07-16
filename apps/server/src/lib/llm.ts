import env from "@/config/env";
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
      });

    default:
      throw new Error(`Unsupported model: ${model}`);
  }
};
