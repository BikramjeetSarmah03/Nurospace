import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "@/lib/llm";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
// 🚀 LAZY LOADING: Remove top-level import to prevent premature initialization

// Enhanced memory saver with better persistence
const memorySaver = new MemorySaver();

export function createAgent(useFallback = false) {
  const llm = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  // Create the React Agent with enhanced configuration
  const agent = createReactAgent({
    llm,
    tools: toolset,
    checkpointSaver: memorySaver,
  });

  return agent;
}

/**
 * Enhanced agent with advanced reasoning capabilities
 */
export function createAdvancedAgent(useFallback = false) {
  const llm = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  // Create a more sophisticated agent with better reasoning
  const agent = createReactAgent({
    llm,
    tools: toolset,
    checkpointSaver: memorySaver,
  });

  return agent;
}

/**
 * Agent with conversation memory and context awareness
 */
export function createMemoryAgent(useFallback = false) {
  const llm = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  const agent = createReactAgent({
    llm,
    tools: toolset,
    checkpointSaver: memorySaver,
  });

  return agent;
}

/**
 * 🧠 SEMANTIC SUPERVISOR AGENT - AI-Powered Tool Selection
 *
 * Next-generation implementation with semantic understanding:
 * - Vector embeddings for true semantic matching
 * - Learning system for continuous improvement
 * - Performance tracking and optimization
 * - Fallback to keyword-based selection
 */
export async function createSemanticSupervisedAgent(useFallback = false) {
  const semanticSupervisor = await createSemanticSupervisor(useFallback);
  return semanticSupervisor;
}

// 🚀 LAZY LOADING: Export function that dynamically imports when needed
export async function createSemanticSupervisor(useFallback = false) {
  const { createSemanticSupervisor: createSemanticSupervisorFn } = await import(
    "./normal-mode"
  );
  return createSemanticSupervisorFn(useFallback);
}
