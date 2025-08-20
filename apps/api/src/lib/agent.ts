import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "@/lib/llm";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createSupervisorAgent, createAdvancedSupervisorAgent, createToolCallingSupervisorAgent, createHybridSupervisorAgent, createSemanticSupervisorAgent } from "./supervisor-agent";
import { createSemanticSupervisor } from "./semantic-supervisor";

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

/**
 * 🚀 HYBRID SUPERVISOR AGENT - Function Calling + Caching + Fallback
 * 
 * Production-ready implementation with optimal performance:
 * - Function calling for efficient routing
 * - Smart caching for repeated queries  
 * - Fallback strategies for reliability
 * - Token optimization and cost control
 */
export function createHybridSupervisedAgent(useFallback = false) {
  return createHybridSupervisorAgent(useFallback);
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
export function createSemanticSupervisedAgent(useFallback = false) {
  return createSemanticSupervisor(useFallback);
}

// Export supervisor functions for direct use
export { createSupervisorAgent, createAdvancedSupervisorAgent, createToolCallingSupervisorAgent, createHybridSupervisorAgent, createSemanticSupervisorAgent } from "./supervisor-agent";
export { createSemanticSupervisor } from "./semantic-supervisor";
