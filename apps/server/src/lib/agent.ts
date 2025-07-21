import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "./llm";

const memorySaver = new MemorySaver();

export function createAgent(useFallback = false) {
  const llm = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  return createReactAgent({
    llm,
    tools: toolset,
    checkpointSaver: memorySaver,
  });
}
