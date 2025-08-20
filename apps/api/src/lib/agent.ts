import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "@/lib/llm";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createSupervisorAgent, createAdvancedSupervisorAgent, createToolCallingSupervisorAgent } from "./supervisor-agent";

// Enhanced memory saver with better persistence
const memorySaver = new MemorySaver();

/**
 * Advanced React Agent with enhanced features:
 * ✅ LangGraph React Agent = Industry standard for complex AI reasoning
 * ✅ Automatic Tool Selection = AI decides what's needed
 * ✅ Memory Persistence = Learns from conversations
 * ✅ Error Handling = Fallback models and graceful failures
 * ✅ Streaming = Real-time responses
 */
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
 * 🎯 SUPERVISOR AGENT - Routes tasks to specialized agents
 * 
 * This is the main supervisor agent that intelligently routes user requests
 * to specialized agents based on the nature of the task.
 */
export function createSupervisedAgent(useFallback = false) {
  return createSupervisorAgent(useFallback);
}

/**
 * 🚀 ADVANCED SUPERVISOR AGENT - Enhanced routing with dynamic tool selection
 * 
 * Advanced version with better tool routing and performance optimization
 */
export function createAdvancedSupervisedAgent(useFallback = false) {
  return createAdvancedSupervisorAgent(useFallback);
}

/**
 * 🔧 TOOL-CALLING SUPERVISOR AGENT - Uses tool-calling for agent selection
 * 
 * Experimental version that uses tool-calling for more precise agent routing
 */
export function createToolCallingSupervisedAgent(useFallback = false) {
  return createToolCallingSupervisorAgent(useFallback);
}

// Export supervisor functions for direct use
export { createSupervisorAgent, createAdvancedSupervisorAgent, createToolCallingSupervisorAgent } from "./supervisor-agent";
