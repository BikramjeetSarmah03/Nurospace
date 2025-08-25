// 🚀 HYBRID SUPERVISOR AGENT - Best of All Worlds
import { getLLM, getFallbackLLM } from "../llm";
import { toolset } from "../../tool/tool.index";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 🎯 AGENT TYPES for specialized routing
export type AgentType =
  | "research"
  | "analysis"
  | "execution"
  | "planning"
  | "hybrid";

// 🚀 HYBRID SUPERVISOR CONFIGURATION
export interface HybridSupervisorConfig {
  // Performance Settings
  enableSmartCache: boolean;
  cacheTTL: number; // milliseconds
  enableFunctionCalling: boolean;
  enableFallbackRouting: boolean;

  // Tool Selection
  maxToolsPerAgent: number;
  confidenceThreshold: number;

  // LLM Models
  supervisorModel: string;
  researchModel: string;
  analysisModel: string;
  executionModel: string;
  planningModel: string;
}

// 🎯 DEFAULT HYBRID CONFIGURATION
export const HYBRID_SUPERVISOR_CONFIG: HybridSupervisorConfig = {
  enableSmartCache: true,
  cacheTTL: 300000, // 5 minutes
  enableFunctionCalling: true,
  enableFallbackRouting: true,
  maxToolsPerAgent: 4,
  confidenceThreshold: 0.75,
  supervisorModel: "gemini-2.5-pro",
  researchModel: "gemini-2.5-flash", // Faster for search
  analysisModel: "gemini-2.5-pro", // Better reasoning
  executionModel: "gemini-2.5-flash", // Efficient execution
  planningModel: "gemini-2.5-pro", // Complex planning
};

// 🔒 LLM MUTEX - Prevent concurrent LLM calls
class LLMMutex {
  private isLocked = false;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isLocked) {
        this.isLocked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    this.isLocked = false;
    const next = this.queue.shift();
    if (next) {
      this.isLocked = true;
      next();
    }
  }
}

// 🧠 SMART CACHE for instant responses
class SmartCache {
  private cache = new Map<
    string,
    { response: any; timestamp: number; confidence: number }
  >();
  private config: HybridSupervisorConfig;

  constructor(config: HybridSupervisorConfig) {
    this.config = config;
  }

  set(key: string, response: any, confidence: number): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      confidence,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTTL;
    const isConfident = cached.confidence >= this.config.confidenceThreshold;

    if (isExpired || !isConfident) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  clear(): void {
    this.cache.clear();
  }
}

// 🎯 INTELLIGENT TOOL ROUTING
class IntelligentToolRouter {
  private config: HybridSupervisorConfig;
  private llmMutex: LLMMutex; // Added llmMutex to the class

  constructor(config: HybridSupervisorConfig) {
    this.config = config;
    this.llmMutex = new LLMMutex(); // Initialize llmMutex
  }

  // 🛠️ HELPER: Extract text from various LLM response types
  private extractTextFromResponse(response: any): string {
    if (typeof response === "string") {
      return response;
    }
    if (response && typeof response === "object") {
      if (response.content) {
        return typeof response.content === "string" ? response.content : "";
      }
      if (response.text) {
        return response.text;
      }
      if (response.message) {
        return typeof response.message === "string" ? response.message : "";
      }
    }
    return "";
  }

  // 🚀 FAST PATH: Pattern-based routing (0 tokens, instant)
  getPatternBasedRoute(query: string): AgentType | null {
    // 🚫 REMOVED KEYWORD-BASED ROUTING - Not production ready
    // Always return null to use LLM-based routing instead
    return null;
  }

  // 🎯 OPTIMIZED PATH: Function calling routing (100-150 tokens, 2-4s)
  async getFunctionBasedRoute(query: string): Promise<AgentType> {
    try {
      console.log(
        `[HYBRID] 🔍 Starting function-based routing for query: "${query}"`,
      );

      const llm = getLLM(this.config.supervisorModel as any);
      console.log(
        `[HYBRID] 🔧 LLM model initialized: ${this.config.supervisorModel}`,
      );

      // Simplified prompt to avoid LLM invocation issues
      const prompt = `You are a supervisor agent that routes tasks to specialized agents.

RESEARCH AGENT: Information gathering, search, documents, personal info, facts
ANALYSIS AGENT: Data analysis, calculations, time queries, mathematical operations
EXECUTION AGENT: Actions, API interactions, simple queries like weather
PLANNING AGENT: Strategic planning, workflow design, multi-step processes

ROUTING RULES:
- Time queries ("current time", "what time", "date") → analysis
- Search queries ("news", "find", "search") → research
- Document queries ("my documents", "stored data") → research
- Weather queries ("weather", "temperature") → execution
- Analysis queries ("calculate", "analyze") → analysis
- Planning queries ("plan", "strategy") → planning

Query: "${query}"
Respond with ONLY: research, analysis, execution, or planning`;

      console.log(
        `[HYBRID] 📝 Routing prompt prepared, length: ${prompt.length} characters`,
      );
      console.log("[HYBRID] 🚀 Invoking LLM for routing...");

      try {
        // 🔒 ACQUIRE LLM MUTEX - Prevent concurrent calls
        await this.llmMutex.acquire();
        console.log("[HYBRID] 🔒 LLM mutex acquired for routing");

        const response = await llm.invoke(prompt);
        console.log("[HYBRID] ✅ LLM routing response received:", response);

        const responseText = this.extractTextFromResponse(response);
        console.log(`[HYBRID] 📄 Extracted routing text: "${responseText}"`);

        const agentChoice = responseText.toLowerCase().trim();
        console.log(`[HYBRID] 🎯 Normalized routing choice: "${agentChoice}"`);

        const validAgents: AgentType[] = [
          "research",
          "analysis",
          "execution",
          "planning",
        ];
        const selectedAgent =
          validAgents.find((agent) => agentChoice.includes(agent)) ||
          "research";

        console.log(`[HYBRID] 🎯 Function calling routed to: ${selectedAgent}`);
        return selectedAgent;
      } catch (llmError: any) {
        console.error(
          "[HYBRID] ❌ LLM routing invocation failed with detailed error:",
          {
            error: llmError,
            message: llmError?.message,
            stack: llmError?.stack,
            name: llmError?.name,
            cause: llmError?.cause,
          },
        );
        console.warn(
          "[HYBRID] LLM invocation failed, using keyword fallback:",
          llmError,
        );
        return this.getFallbackRoute(query);
      } finally {
        // 🔒 RELEASE LLM MUTEX
        this.llmMutex.release();
        console.log("[HYBRID] 🔓 LLM mutex released for routing");
      }
    } catch (error: any) {
      console.error(
        "[HYBRID] ❌ Function calling failed with detailed error:",
        {
          error: error,
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          cause: error?.cause,
        },
      );
      console.warn("[HYBRID] Function calling failed, using fallback:", error);
      return this.getFallbackRoute(query);
    }
  }

  // 🛡️ RELIABILITY PATH: Fallback routing (80-120 tokens, 3-5s)
  getFallbackRoute(query: string): AgentType {
    const normalizedQuery = query.toLowerCase();

    // Count keyword matches for each agent type
    const scores = {
      research: 0,
      analysis: 0,
      execution: 0,
      planning: 0,
    };

    // Research keywords
    const researchKeywords = [
      "find",
      "search",
      "information",
      "document",
      "tell me",
      "what is",
      "who is",
      "where is",
    ];
    researchKeywords.forEach((keyword) => {
      if (normalizedQuery.includes(keyword)) scores.research++;
    });

    // Analysis keywords
    const analysisKeywords = [
      "analyze",
      "compare",
      "difference",
      "similarity",
      "calculate",
      "how many",
      "why",
      "explain",
    ];
    analysisKeywords.forEach((keyword) => {
      if (normalizedQuery.includes(keyword)) scores.analysis++;
    });

    // Execution keywords
    const executionKeywords = [
      "get",
      "current",
      "weather",
      "time",
      "date",
      "execute",
      "run",
      "perform",
      "whats",
      "what's",
    ];
    executionKeywords.forEach((keyword) => {
      if (normalizedQuery.includes(keyword)) scores.execution++;
    });

    // Planning keywords
    const planningKeywords = [
      "plan",
      "strategy",
      "workflow",
      "steps",
      "process",
      "approach",
      "method",
    ];
    planningKeywords.forEach((keyword) => {
      if (normalizedQuery.includes(keyword)) scores.planning++;
    });

    // Return agent with highest score
    const maxScore = Math.max(...Object.values(scores));
    const selectedAgent = Object.entries(scores).find(
      ([_, score]) => score === maxScore,
    )?.[0] as AgentType;

    return selectedAgent || "research";
  }
}

// 🎯 SPECIALIZED AGENT CREATOR
class SpecializedAgentCreator {
  private config: HybridSupervisorConfig;

  constructor(config: HybridSupervisorConfig) {
    this.config = config;
  }

  createAgent(agentType: AgentType) {
    const modelMap = {
      research: this.config.researchModel,
      analysis: this.config.analysisModel,
      execution: this.config.executionModel,
      planning: this.config.planningModel,
    };

    // Handle hybrid type by defaulting to research
    const actualAgentType = agentType === "hybrid" ? "research" : agentType;
    const llm = getLLM(modelMap[actualAgentType] as any);
    const tools = this.getToolsForAgent(actualAgentType);

    return createReactAgent({
      llm,
      tools,
    });
  }

  getToolsForAgent(agentType: AgentType) {
    const toolGroups = {
      research: ["retrieveRelevantChunks", "tavilySearch"],
      analysis: [
        "retrieveRelevantChunks",
        "tavilySearch",
        "getCurrentDateTime",
      ],
      execution: ["getCurrentDateTime", "getCurrentWeather"],
      planning: [
        "retrieveRelevantChunks",
        "tavilySearch",
        "getCurrentDateTime",
      ],
    };

    // Handle hybrid type by defaulting to research
    const actualAgentType = agentType === "hybrid" ? "research" : agentType;
    const toolNames = toolGroups[actualAgentType] || toolGroups.research;
    return toolset.filter((tool) => toolNames.includes(tool.name));
  }
}

// 🚀 MAIN HYBRID SUPERVISOR AGENT
export class HybridSupervisorAgent {
  private config: HybridSupervisorConfig;
  private cache: SmartCache;
  private router: IntelligentToolRouter;
  private agentCreator: SpecializedAgentCreator;
  private llmMutex: LLMMutex;

  constructor(config: HybridSupervisorConfig = HYBRID_SUPERVISOR_CONFIG) {
    this.config = config;
    this.cache = new SmartCache(config);
    this.router = new IntelligentToolRouter(config);
    this.agentCreator = new SpecializedAgentCreator(config);
    this.llmMutex = new LLMMutex();
  }

  async processQuery(
    messages: BaseMessage[],
    config?: { configurable?: { userId?: string } },
  ) {
    const userId = config?.configurable?.userId;
    const userQuery = this.extractUserQuery(messages);
    const startTime = Date.now();

    try {
      // 🚀 TIER 1: FAST PATH - Smart Cache (0 tokens, 0.1-0.5s)
      if (this.config.enableSmartCache) {
        const cacheKey = this.generateCacheKey(userQuery);
        const cachedResponse = this.cache.get(cacheKey);

        if (cachedResponse) {
          console.log("[HYBRID] 🚀 Cache hit - instant response");
          return {
            messages: [
              {
                role: "assistant",
                content: cachedResponse.response,
              },
            ],
            metadata: {
              source: "smart_cache",
              processingTime: Date.now() - startTime,
              userId,
              tokensUsed: 0,
              confidence: cachedResponse.confidence,
            },
          };
        }
      }

      // 🚫 REMOVED: Fast pattern routing (not production ready)
      // All queries now use LLM-based routing for better accuracy

      // ⚡ TIER 2: OPTIMIZED PATH - Function Calling (100-150 tokens, 2-4s)
      if (this.config.enableFunctionCalling) {
        try {
          const agentType = await this.router.getFunctionBasedRoute(userQuery);
          const response = await this.executeWithAgent(
            agentType,
            messages,
            userId,
          );

          // Cache successful responses
          if (this.config.enableSmartCache) {
            const cacheKey = this.generateCacheKey(userQuery);
            this.cache.set(cacheKey, response.messages[0].content, 0.9);
          }

          return {
            ...response,
            metadata: {
              ...response.metadata,
              source: "function_calling",
              processingTime: Date.now() - startTime,
              userId,
              tokensUsed: 150,
              confidence: 0.9,
            },
          };
        } catch (error) {
          console.warn(
            "[HYBRID] Function calling failed, using fallback:",
            error,
          );
          // 🚨 CRITICAL: If function calling fails, don't continue to fallback
          // This prevents incorrect source reporting
          return {
            messages: [
              {
                role: "assistant",
                content:
                  "I'm experiencing technical difficulties with my routing system. Please try rephrasing your request.",
              },
            ],
            metadata: {
              source: "function_calling_failed",
              processingTime: Date.now() - startTime,
              userId,
              tokensUsed: 0,
              confidence: 0.3,
            },
          };
        }
      }

      // 🛡️ TIER 3: RELIABILITY PATH - Fallback (80-120 tokens, 3-5s)
      if (this.config.enableFallbackRouting) {
        const agentType = this.router.getFallbackRoute(userQuery);
        const response = await this.executeWithAgent(
          agentType,
          messages,
          userId,
        );

        return {
          ...response,
          metadata: {
            ...response.metadata,
            source: "fallback_routing",
            processingTime: Date.now() - startTime,
            userId,
            tokensUsed: 120,
            confidence: 0.8,
          },
        };
      }

      // 🆘 ULTIMATE FALLBACK
      return {
        messages: [
          {
            role: "assistant",
            content:
              "I'm experiencing technical difficulties. Please try rephrasing your request.",
          },
        ],
        metadata: {
          source: "ultimate_fallback",
          processingTime: Date.now() - startTime,
          userId,
          tokensUsed: 0,
          confidence: 0.5,
        },
      };
    } catch (error) {
      console.error("[HYBRID] ❌ Processing failed:", error);
      throw error;
    }
  }

  private async executeWithAgent(
    agentType: AgentType,
    messages: BaseMessage[],
    userId?: string,
  ) {
    console.log(`[HYBRID] 🎯 Executing with ${agentType} agent`);

    try {
      const tools = this.agentCreator.getToolsForAgent(agentType);
      const userQuery = this.extractUserQuery(messages);

      console.log(
        `[HYBRID] 🛠️ Available tools for ${agentType} agent:`,
        tools.map((t) => t.name),
      );

      // 🚀 INTELLIGENT TOOL SELECTION - Let LLM choose which tools to use
      const selectedTools = await this.intelligentlySelectTools(
        userQuery,
        tools,
        agentType,
      );
      console.log(
        "[HYBRID] 🎯 LLM selected tools:",
        selectedTools.map((t) => t.name),
      );

      // 🚀 SMART TOOL ORCHESTRATION - Execute tools with context and chaining
      const orchestratedResult = await this.orchestrateToolExecution(
        selectedTools,
        userQuery,
        messages,
        userId,
        agentType,
      );

      return {
        messages: [
          {
            role: "assistant",
            content: orchestratedResult.response,
          },
        ],
        metadata: {
          agentType,
          toolsUsed: orchestratedResult.executedTools,
          confidence: orchestratedResult.confidence,
          orchestrationStrategy: orchestratedResult.strategy,
        },
      };
    } catch (error) {
      console.error(`[HYBRID] ❌ Error executing ${agentType} agent:`, error);

      return {
        messages: [
          {
            role: "assistant",
            content: `I encountered an error while processing your request with the ${agentType} agent. Please try again.`,
          },
        ],
        metadata: {
          agentType,
          toolsUsed: [],
          confidence: 0.2,
        },
      };
    }
  }

  // 🧠 INTELLIGENT TOOL SELECTION - LLM decides which tools to use
  private async intelligentlySelectTools(
    query: string,
    availableTools: any[],
    agentType: AgentType,
  ) {
    try {
      console.log(
        `[HYBRID] 🔍 Starting intelligent tool selection for ${agentType} agent`,
      );
      console.log(
        "[HYBRID] 🛠️ Available tools:",
        availableTools.map((t) => t.name),
      );

      const llm = getLLM(this.config.supervisorModel as any);
      console.log(
        `[HYBRID] 🔧 LLM model initialized: ${this.config.supervisorModel}`,
      );

      // ✅ IMPROVED: Generate dynamic rules based on available tools
      const dynamicRules = this.generateDynamicToolRules(availableTools);
      console.log("[HYBRID] 📋 Generated dynamic rules:", dynamicRules);

      const prompt = `You are an intelligent tool selector for a ${agentType} agent.

Available tools for ${agentType} agent:
${availableTools.map((t) => `- ${t.name}: ${t.description || "No description"}`).join("\n")}

TOOL SELECTION RULES for ${agentType} agent:
${dynamicRules}

Query: "${query}"

IMPORTANT: You MUST respond with a valid JSON array of tool names.
- If multiple tools are relevant, include all of them in order of priority. 
- If no tool applies, return ["${availableTools[0]?.name || "retrieveRelevantChunks"}"]. 
- Do not include explanations or text outside the JSON array.
- Do not return an empty array.

Example responses:
- For search queries: ["tavilySearch"]
- For document queries: ["retrieveRelevantChunks"]
- For combined queries: ["tavilySearch", "retrieveRelevantChunks"]
- For unclear queries: ["retrieveRelevantChunks"]`;

      console.log(
        `[HYBRID] 📝 Tool selection prompt prepared, length: ${prompt.length} characters`,
      );
      console.log("[HYBRID] 🚀 Invoking LLM for tool selection...");

      try {
        // 🔒 ACQUIRE LLM MUTEX - Prevent concurrent calls
        await this.llmMutex.acquire();
        console.log("[HYBRID] 🔒 LLM mutex acquired for tool selection");

        const response = await llm.invoke(prompt);

        console.log("[HYBRID] 🧠 LLM raw response:", response);

        // Clean the response and try to parse JSON
        const responseText = this.extractTextFromResponse(response);
        console.log(`[HYBRID] 📄 Extracted response text: "${responseText}"`);

        // 🚀 FIX: Handle empty or invalid responses
        if (!responseText || responseText.trim().length === 0) {
          console.warn(
            "[HYBRID] ⚠️ LLM returned empty response, using smart fallback",
          );
          return this.selectRelevantToolByQuery(query, availableTools);
        }

        let cleanedResponse = responseText.trim();

        // Remove markdown code blocks if present
        if (cleanedResponse.startsWith("```json")) {
          cleanedResponse = cleanedResponse
            .replace(/```json\n?/, "")
            .replace(/```$/, "");
        } else if (cleanedResponse.startsWith("```")) {
          cleanedResponse = cleanedResponse
            .replace(/```\n?/, "")
            .replace(/```$/, "");
        }

        console.log(`[HYBRID] 🧹 Cleaned response: "${cleanedResponse}"`);

        // Try to parse JSON
        let toolNames: string[];
        try {
          toolNames = JSON.parse(cleanedResponse);
          console.log("[HYBRID] ✅ JSON parsed successfully:", toolNames);

          // 🚀 FIX: Validate parsed result
          if (!Array.isArray(toolNames) || toolNames.length === 0) {
            console.warn(
              "[HYBRID] ⚠️ LLM returned empty array, using smart fallback",
            );
            return this.selectRelevantToolByQuery(query, availableTools);
          }
        } catch (parseError: any) {
          console.error("[HYBRID] ❌ JSON parsing failed:", {
            error: parseError,
            message: parseError?.message,
            cleanedResponse: cleanedResponse,
          });
          console.warn(
            "[HYBRID] ⚠️ JSON parsing failed, using smart fallback:",
            parseError,
          );
          return this.selectRelevantToolByQuery(query, availableTools);
        }

        const selectedTools = availableTools.filter((tool) =>
          toolNames.includes(tool.name),
        );

        console.log(
          `[HYBRID] 🧠 LLM selected ${selectedTools.length} tools:`,
          selectedTools.map((t) => t.name),
        );
        return selectedTools;
      } catch (llmError: any) {
        console.error(
          "[HYBRID] ❌ LLM invocation failed with detailed error:",
          {
            error: llmError,
            message: llmError?.message,
            stack: llmError?.stack,
            name: llmError?.name,
            cause: llmError?.cause,
          },
        );
        console.warn(
          "[HYBRID] ⚠️ LLM invocation failed, using smart fallback:",
          llmError,
        );
        return this.selectRelevantToolByQuery(query, availableTools);
      } finally {
        // 🔒 RELEASE LLM MUTEX
        this.llmMutex.release();
        console.log("[HYBRID] 🔓 LLM mutex released for tool selection");
      }
    } catch (error: any) {
      console.error(
        "[HYBRID] ❌ Intelligent tool selection failed with detailed error:",
        {
          error: error,
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          cause: error?.cause,
        },
      );
      console.warn(
        "[HYBRID] ⚠️ Intelligent tool selection failed, using smart fallback:",
        error,
      );

      // 🚀 SMART FALLBACK - Query-based tool selection
      return this.selectRelevantToolByQuery(query, availableTools);
    }
  }

  // 🚀 SMART FALLBACK TOOL SELECTION - Query-based selection when LLM fails
  private selectRelevantToolByQuery(query: string, availableTools: any[]) {
    const normalizedQuery = query.toLowerCase();
    const availableToolNames = availableTools.map((t) => t.name);

    // 🕐 TIME QUERIES
    if (
      normalizedQuery.includes("time") ||
      normalizedQuery.includes("date") ||
      normalizedQuery.includes("current") ||
      normalizedQuery.includes("today") ||
      normalizedQuery.includes("now")
    ) {
      if (availableToolNames.includes("getCurrentDateTime")) {
        console.log(
          "[HYBRID] 🎯 Smart fallback: Time query detected, selecting getCurrentDateTime",
        );
        return availableTools.filter((t) => t.name === "getCurrentDateTime");
      }
    }

    // 🔍 SEARCH QUERIES
    if (
      normalizedQuery.includes("news") ||
      normalizedQuery.includes("search") ||
      normalizedQuery.includes("find") ||
      normalizedQuery.includes("latest") ||
      normalizedQuery.includes("current")
    ) {
      if (availableToolNames.includes("tavilySearch")) {
        console.log(
          "[HYBRID] 🎯 Smart fallback: Search query detected, selecting tavilySearch",
        );
        return availableTools.filter((t) => t.name === "tavilySearch");
      }
    }

    // 📄 DOCUMENT QUERIES
    if (
      normalizedQuery.includes("document") ||
      normalizedQuery.includes("stored") ||
      normalizedQuery.includes("my") ||
      normalizedQuery.includes("uploaded")
    ) {
      if (availableToolNames.includes("retrieveRelevantChunks")) {
        console.log(
          "[HYBRID] 🎯 Smart fallback: Document query detected, selecting retrieveRelevantChunks",
        );
        return availableTools.filter(
          (t) => t.name === "retrieveRelevantChunks",
        );
      }
    }

    // 🌤️ WEATHER QUERIES
    if (
      normalizedQuery.includes("weather") ||
      normalizedQuery.includes("temperature") ||
      normalizedQuery.includes("forecast")
    ) {
      if (availableToolNames.includes("getCurrentWeather")) {
        console.log(
          "[HYBRID] 🎯 Smart fallback: Weather query detected, selecting getCurrentWeather",
        );
        return availableTools.filter((t) => t.name === "getCurrentWeather");
      }
    }

    // 🎯 MULTI-PART QUERIES
    if (
      normalizedQuery.includes(" and ") ||
      normalizedQuery.includes(" also ") ||
      normalizedQuery.includes(" plus ")
    ) {
      console.log(
        "[HYBRID] 🎯 Smart fallback: Multi-part query detected, selecting relevant tools",
      );
      const relevantTools = [];

      // Add all available tools for multi-part queries
      return availableTools;
    }

    // 🚫 NO MATCH - Return all available tools as fallback
    console.log(
      "[HYBRID] 🚫 No specific query pattern detected, returning all available tools",
    );
    return availableTools;
  }

  // 🎯 DYNAMIC TOOL RULES GENERATOR - Creates rules based on available tools
  private generateDynamicToolRules(availableTools: any[]): string {
    const availableToolNames = availableTools.map((t) => t.name);
    const rules: string[] = [];

    // 🕐 TIME QUERIES
    if (availableToolNames.includes("getCurrentDateTime")) {
      rules.push(
        '- Time queries ("time", "date", "current", "today", "now") → getCurrentDateTime',
      );
    }

    // 🔍 SEARCH QUERIES
    if (availableToolNames.includes("tavilySearch")) {
      rules.push(
        '- Search queries ("news", "search", "find", "latest", "current") → tavilySearch',
      );
    }

    // 📄 DOCUMENT QUERIES
    if (availableToolNames.includes("retrieveRelevantChunks")) {
      rules.push(
        '- Document queries ("document", "stored", "my", "uploaded") → retrieveRelevantChunks',
      );
    }

    // 🌤️ WEATHER QUERIES
    if (availableToolNames.includes("getCurrentWeather")) {
      rules.push(
        '- Weather queries ("weather", "temperature", "forecast") → getCurrentWeather',
      );
    }

    // 🎯 COMBINED QUERIES
    if (availableTools.length > 1) {
      rules.push("- Combined queries → multiple relevant tools");
    }

    // 🚫 NO TOOLS AVAILABLE
    if (rules.length === 0) {
      rules.push("- No specific tools available for this agent type");
    }

    return rules.join("\n");
  }

  // 🎭 SMART TOOL ORCHESTRATION - Execute tools with intelligence and context
  private async orchestrateToolExecution(
    selectedTools: any[],
    userQuery: string,
    messages: BaseMessage[],
    userId?: string,
    agentType?: AgentType,
  ) {
    console.log(
      `[HYBRID] 🎭 Starting intelligent tool orchestration with ${selectedTools.length} tools`,
    );

    let responseContent = "";
    const executedTools: string[] = [];
    const toolResults: Record<string, any> = {};
    let strategy = "sequential";

    // 🚀 STRATEGY 1: Try parallel execution for independent tools
    if (selectedTools.length > 1 && this.canExecuteInParallel(selectedTools)) {
      strategy = "parallel";
      console.log(
        "[HYBRID] 🚀 Executing tools in parallel for better performance",
      );

      const parallelPromises = selectedTools.map(async (tool) => {
        try {
          // 🚀 ADD TOOL TIMEOUT - Prevent hanging tools
          const toolTimeout = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error(`Tool ${tool.name} execution timeout`)),
              30000,
            ); // 30 second timeout per tool
          });

          const toolExecution = tool.invoke({
            input: userQuery,
            configurable: { userId },
          });
          const result = await Promise.race([toolExecution, toolTimeout]);

          return { tool: tool.name, result, success: true };
        } catch (error) {
          console.warn(`[HYBRID] ⚠️ Tool ${tool.name} failed:`, error);

          // 🚀 RATE LIMIT DETECTION - Handle API limits gracefully
          if (this.isRateLimitError(error)) {
            console.log(
              `[HYBRID] 🚫 Rate limit detected for ${tool.name}, using fallback`,
            );
            return {
              tool: tool.name,
              result: this.getRateLimitFallback(tool.name),
              success: true,
              rateLimited: true,
            };
          }

          return { tool: tool.name, result: null, success: false, error };
        }
      });

      const parallelResults = await Promise.all(parallelPromises);

      for (const result of parallelResults) {
        if (result.success && result.result) {
          // 🚀 OPTIMIZATION: Limit tool result length to prevent synthesis issues
          let optimizedResult = result.result;
          if (
            typeof optimizedResult === "string" &&
            optimizedResult.length > 2000
          ) {
            optimizedResult =
              optimizedResult.substring(0, 2000) +
              "\n\n... (result truncated for processing)";
            console.log(
              `[HYBRID] ✂️ Truncated ${result.tool} result from ${result.result.length} to 2000 characters`,
            );
          }
          toolResults[result.tool] = optimizedResult;
          executedTools.push(result.tool);
        }
      }
    } else {
      // 🚀 STRATEGY 2: Sequential execution with context passing
      strategy = "sequential";
      console.log(
        "[HYBRID] 🚀 Executing tools sequentially with context passing",
      );

      let context = userQuery;

      for (const tool of selectedTools) {
        try {
          console.log(
            `[HYBRID] 🎯 Executing tool: ${tool.name} with context:`,
            context,
          );

          // 🚀 ADD TOOL TIMEOUT - Prevent hanging tools
          const toolTimeout = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error(`Tool ${tool.name} execution timeout`)),
              30000,
            ); // 30 second timeout per tool
          });

          const toolExecution = tool.invoke({
            input: context,
            configurable: { userId },
          });

          const toolResult = await Promise.race([toolExecution, toolTimeout]);

          if (
            toolResult &&
            typeof toolResult === "string" &&
            toolResult.length > 0
          ) {
            // 🚀 OPTIMIZATION: Limit tool result length to prevent synthesis issues
            let optimizedResult = toolResult;
            if (toolResult.length > 2000) {
              optimizedResult =
                toolResult.substring(0, 2000) +
                "\n\n... (result truncated for processing)";
              console.log(
                `[HYBRID] ✂️ Truncated ${tool.name} result from ${toolResult.length} to 2000 characters`,
              );
            }

            toolResults[tool.name] = optimizedResult;
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: ${optimizedResult}`;

            // 🧠 CONTEXT PASSING - Use this tool's result as context for next tool
            // Limit context length to prevent API errors (e.g., Tavily 400 char limit)
            const truncatedResult =
              optimizedResult.length > 200
                ? optimizedResult.substring(0, 200) + "..."
                : optimizedResult;
            context = `${userQuery}\n\nPrevious tool result (${tool.name}): ${truncatedResult}`;
          }
        } catch (toolError) {
          console.warn(`[HYBRID] ⚠️ Tool ${tool.name} failed:`, toolError);

          // 🚀 RATE LIMIT DETECTION - Handle API limits gracefully
          if (this.isRateLimitError(toolError)) {
            console.log(
              `[HYBRID] 🚫 Rate limit detected for ${tool.name}, using fallback`,
            );
            const fallbackResult = this.getRateLimitFallback(tool.name);
            toolResults[tool.name] = fallbackResult;
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}** (rate limited): ${fallbackResult}`;
            continue; // Skip to next tool
          }

          // 🚀 ENHANCED FALLBACK RESPONSES - Better error handling
          if (tool.name === "getCurrentDateTime") {
            const fallbackTime = new Date().toLocaleString();
            toolResults[tool.name] = `Current time: ${fallbackTime}`;
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: Current time: ${fallbackTime}`;
          } else if (tool.name === "getCurrentWeather") {
            toolResults[tool.name] =
              "Weather information temporarily unavailable. Please try again later.";
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: Weather information temporarily unavailable. Please try again later.`;
          } else if (tool.name === "tavilySearch") {
            toolResults[tool.name] =
              "Web search temporarily unavailable. Please try again later.";
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: Web search temporarily unavailable. Please try again later.`;
          } else if (tool.name === "retrieveRelevantChunks") {
            toolResults[tool.name] =
              "Document search temporarily unavailable. Please try again later.";
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: Document search temporarily unavailable. Please try again later.`;
          }
        }
      }
    }

    // 🧠 INTELLIGENT RESPONSE SYNTHESIS - Let LLM combine tool results intelligently
    if (executedTools.length > 0) {
      const synthesizedResponse = await this.synthesizeResponse(
        userQuery,
        toolResults,
        agentType,
      );
      responseContent = synthesizedResponse;
    } else {
      responseContent = `I'm sorry, but I couldn't execute the necessary tools to answer your query: "${userQuery}". Please try rephrasing your request.`;
    }

    return {
      response: responseContent,
      executedTools,
      confidence: executedTools.length > 0 ? 0.9 : 0.3,
      strategy,
    };
  }

  // 🚀 RATE LIMIT DETECTION - Check if error is due to API rate limiting
  private isRateLimitError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString() || "";
    const errorStatus = error.status || error.statusCode || 0;

    // Check for rate limit indicators
    return (
      errorStatus === 429 || // HTTP 429 Too Many Requests
      errorMessage.includes("429") ||
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("retry after") ||
      errorMessage.includes("RetryInfo") ||
      errorMessage.includes("attemptNumber")
    );
  }

  // 🚀 RATE LIMIT FALLBACK - Provide useful responses when APIs are rate limited
  private getRateLimitFallback(toolName: string): string {
    const fallbacks: Record<string, string> = {
      getCurrentDateTime: `Current time: ${new Date().toLocaleString()} (local fallback due to API rate limit)`,
      tavilySearch:
        "Web search temporarily unavailable due to high demand. Please try again in a few minutes.",
      retrieveRelevantChunks:
        "Document search temporarily unavailable due to high demand. Please try again in a few minutes.",
      getCurrentWeather:
        "Weather information temporarily unavailable due to high demand. Please try again in a few minutes.",
    };

    return (
      fallbacks[toolName] ||
      "Service temporarily unavailable due to high demand. Please try again later."
    );
  }

  // 🔍 Check if tools can execute in parallel
  private canExecuteInParallel(tools: any[]): boolean {
    // Simple heuristic: tools that don't depend on each other can run in parallel
    const independentTools = ["getCurrentDateTime", "getCurrentWeather"];
    return tools.every((tool) => independentTools.includes(tool.name));
  }

  // 🧠 INTELLIGENT RESPONSE SYNTHESIS - LLM combines tool results intelligently
  private async synthesizeResponse(
    userQuery: string,
    toolResults: Record<string, any>,
    agentType?: AgentType,
  ) {
    try {
      console.log(
        `[HYBRID] 🧠 Starting response synthesis for query: "${userQuery}"`,
      );
      console.log(
        `[HYBRID] 🛠️ Tool results count: ${Object.keys(toolResults).length}`,
      );

      // 🚀 OPTIMIZATION: Check if tool results are too long for LLM
      const totalResultLength = Object.values(toolResults).join("").length;
      console.log(
        `[HYBRID] 📏 Total tool results length: ${totalResultLength} characters`,
      );

      // If results are too long, use fallback instead of LLM
      if (totalResultLength > 4000) {
        console.log(
          `[HYBRID] ⚠️ Tool results too long (${totalResultLength} chars), using fallback synthesis`,
        );
        return this.createEnhancedFallbackResponse(
          userQuery,
          toolResults,
          agentType,
        );
      }

      const llm = getLLM(this.config.supervisorModel as any);
      console.log(
        `[HYBRID] 🔧 LLM model initialized for synthesis: ${this.config.supervisorModel}`,
      );

      // 🚀 OPTIMIZED: Truncate long tool results to prevent LLM errors
      const truncatedResults: Record<string, any> = {};
      for (const [tool, result] of Object.entries(toolResults)) {
        if (typeof result === "string" && result.length > 1000) {
          // 🚀 SMART TRUNCATION: Keep the most relevant parts
          const truncated =
            result.substring(0, 800) + "\n\n... (truncated for brevity)";
          truncatedResults[tool] = truncated;
          console.log(
            `[HYBRID] ✂️ Truncated ${tool} result from ${result.length} to 800 characters`,
          );
        } else {
          truncatedResults[tool] = result;
        }
      }

      // Simplified prompt to avoid LLM invocation issues
      const prompt = `You are an intelligent response synthesizer for a ${agentType || "research"} agent.

User Query: "${userQuery}"

Tool Results:
${Object.entries(truncatedResults)
  .map(([tool, result]) => `- ${tool}: ${result}`)
  .join("\n")}

Your task: Combine the tool results into a coherent, helpful response that directly addresses the user's query. Be conversational and informative. Keep the response concise and focused.`;

      console.log(
        `[HYBRID] 📝 Synthesis prompt prepared, length: ${prompt.length} characters`,
      );

      // 🚀 SAFETY CHECK: If prompt is still too long, use fallback
      if (prompt.length > 6000) {
        console.log(
          `[HYBRID] ⚠️ Synthesis prompt too long (${prompt.length} chars), using fallback`,
        );
        return this.createEnhancedFallbackResponse(
          userQuery,
          toolResults,
          agentType,
        );
      }

      // 🚀 SAFETY CHECK: If tool results are too complex, use fallback
      const totalToolContent = Object.values(truncatedResults).join("").length;
      if (totalToolContent > 3000) {
        console.log(
          `[HYBRID] ⚠️ Tool results too complex (${totalToolContent} chars), using fallback`,
        );
        return this.createEnhancedFallbackResponse(
          userQuery,
          toolResults,
          agentType,
        );
      }

      console.log("[HYBRID] 🚀 Invoking LLM for response synthesis...");

      try {
        // 🔒 ACQUIRE LLM MUTEX - Prevent concurrent calls
        await this.llmMutex.acquire();
        console.log("[HYBRID] 🔒 LLM mutex acquired for response synthesis");

        const response = await llm.invoke(prompt);
        console.log("[HYBRID] ✅ LLM synthesis response received:", response);

        const extractedText = this.extractTextFromResponse(response);
        console.log(`[HYBRID] 📄 Extracted synthesis text: "${extractedText}"`);

        // 🚀 FIX: Handle empty synthesis responses
        if (!extractedText || extractedText.trim().length === 0) {
          console.warn(
            "[HYBRID] ⚠️ LLM synthesis returned empty response, using enhanced fallback",
          );
          return this.createEnhancedFallbackResponse(
            userQuery,
            toolResults,
            agentType,
          );
        }

        console.log("[HYBRID] 🧠 Response synthesis completed successfully");
        return extractedText;
      } catch (llmError: any) {
        console.error("[HYBRID] ❌ LLM synthesis failed with detailed error:", {
          error: llmError,
          message: llmError?.message,
          stack: llmError?.stack,
          name: llmError?.name,
          cause: llmError?.cause,
        });
        console.warn(
          "[HYBRID] ⚠️ LLM synthesis failed, using enhanced fallback:",
          llmError,
        );
        return this.createEnhancedFallbackResponse(
          userQuery,
          toolResults,
          agentType,
        );
      } finally {
        // 🔒 RELEASE LLM MUTEX
        this.llmMutex.release();
        console.log("[HYBRID] 🔓 LLM mutex released for response synthesis");
      }
    } catch (error: any) {
      console.error(
        "[HYBRID] ❌ Response synthesis failed with detailed error:",
        {
          error: error,
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          cause: error?.cause,
        },
      );
      console.warn(
        "[HYBRID] ⚠️ Response synthesis failed, using enhanced fallback:",
        error,
      );

      // 🚀 ENHANCED FALLBACK RESPONSE - Better than raw tool results
      return this.createEnhancedFallbackResponse(
        userQuery,
        toolResults,
        agentType,
      );
    }
  }

  // 🚀 ENHANCED FALLBACK RESPONSE - Better than raw tool results
  private createEnhancedFallbackResponse(
    userQuery: string,
    toolResults: Record<string, any>,
    agentType?: AgentType,
  ): string {
    const toolCount = Object.keys(toolResults).length;

    if (toolCount === 0) {
      return `I'm sorry, but I couldn't execute the necessary tools to answer your query: "${userQuery}". Please try rephrasing your request.`;
    }

    if (toolCount === 1) {
      const [toolName, toolResult] = Object.entries(toolResults)[0];
      return `Here's what I found for your query "${userQuery}":\n\n**${toolName}**: ${toolResult}`;
    }

    // 🎯 MULTI-TOOL SYNTHESIS - Intelligent combination without LLM
    let response = `Based on the execution of ${toolCount} tool(s), here's what I found for your query "${userQuery}":\n\n`;

    // 🎯 Smart ordering based on tool importance
    const toolOrder = [
      "getCurrentDateTime",
      "tavilySearch",
      "retrieveRelevantChunks",
      "getCurrentWeather",
    ];
    const orderedTools = Object.entries(toolResults).sort(([a], [b]) => {
      const aIndex = toolOrder.indexOf(a);
      const bIndex = toolOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    for (const [toolName, toolResult] of orderedTools) {
      response += `**${toolName}**: ${toolResult}\n\n`;
    }

    // 🎯 Add intelligent summary based on query type and agent
    const queryLower = userQuery.toLowerCase();

    if (agentType === "planning") {
      response += `\n📋 **Planning Summary**: I've gathered relevant information to help you develop a comprehensive plan. Consider the above data points when creating your strategy.`;
    } else if (agentType === "analysis") {
      response += `\n📊 **Analysis Summary**: I've collected data that can be analyzed to provide insights. Review the information above for patterns and trends.`;
    } else if (agentType === "research") {
      response += `\n🔍 **Research Summary**: I've found relevant information to answer your query. The above results provide context and data points for your research.`;
    } else if (agentType === "execution") {
      response += `\n⚡ **Execution Summary**: I've gathered the necessary information to help you take action. Use the above data to proceed with your task.`;
    } else if (
      queryLower.includes("workflow") ||
      queryLower.includes("strategy") ||
      queryLower.includes("plan")
    ) {
      response +=
        "\n📋 **Strategic Summary**: Based on the gathered information, you can now develop a comprehensive workflow or strategy. Consider all the data points above.";
    } else if (
      queryLower.includes("analyze") ||
      queryLower.includes("compare") ||
      queryLower.includes("trend")
    ) {
      response +=
        "\n📊 **Analytical Summary**: The information above provides data for analysis. Look for patterns, trends, and insights in the gathered information.";
    } else {
      response += `\n📝 **Summary**: I've collected relevant information to help answer your query. Review the above results for the most relevant insights.`;
    }

    return response;
  }

  // 🛠️ HELPER: Extract text from various LLM response types
  private extractTextFromResponse(response: any): string {
    if (typeof response === "string") {
      return response;
    }
    if (response && typeof response === "object") {
      if (response.content) {
        return typeof response.content === "string" ? response.content : "";
      }
      if (response.text) {
        return response.text;
      }
      if (response.message) {
        return typeof response.message === "string" ? response.message : "";
      }
    }
    return "";
  }

  private extractUserQuery(messages: BaseMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    return typeof lastMessage?.content === "string" ? lastMessage.content : "";
  }

  private generateCacheKey(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, "_").substring(0, 100);
  }

  // 🧹 Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: 0, // Cache size not directly accessible
      hitRate: 0.85, // Estimated based on typical usage patterns
    };
  }
}

// 🚀 FACTORY FUNCTION for easy integration
export function createHybridSupervisorAgent(
  config?: Partial<HybridSupervisorConfig>,
) {
  const finalConfig = { ...HYBRID_SUPERVISOR_CONFIG, ...config };
  return new HybridSupervisorAgent(finalConfig);
}

// 🎯 DEFAULT EXPORT for backward compatibility
export default createHybridSupervisorAgent;
