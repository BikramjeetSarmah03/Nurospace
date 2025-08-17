export type LLMProvider = "openai" | "google" | "claude" | "mistral";

export interface ModelConfig {
  key: string; // internal name like "default", "chat-fast"
  provider: LLMProvider;
  model: string; // e.g., "gpt-4", "gemini-pro"
  temperature?: number;
  maxTokens?: number;
  description?: string;
  apiKeyEnv?: string; // Optional env var for API key
}
