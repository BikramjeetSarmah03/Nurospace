import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { toolset } from "@/tool/tool.index";

const memorySaver = new MemorySaver();

export function createAgent() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY!,
    temperature: 0,
  });

  return createReactAgent({
    llm,
    tools: toolset,
    checkpointSaver: memorySaver,
  });
}
