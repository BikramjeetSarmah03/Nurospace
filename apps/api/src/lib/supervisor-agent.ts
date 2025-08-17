import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "./llm";
import type { BaseMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";

// Define specialized agents
export type AgentType = "research" | "analysis" | "execution" | "planning";

/**
 * Automatic tool categorization based on tool metadata
 */
function categorizeTool(tool: any): AgentType {
  const name = tool.name.toLowerCase();
  const description = (tool.description || "").toLowerCase();

  // Research tools - search, find, retrieve, gather information
  if (
    name.includes("search") ||
    name.includes("find") ||
    name.includes("retrieve") ||
    description.includes("search") ||
    description.includes("find") ||
    description.includes("gather")
  ) {
    return "research";
  }

  // Analysis tools - analyze, calculate, compute, process data
  if (
    name.includes("analyze") ||
    name.includes("calculate") ||
    name.includes("compute") ||
    description.includes("analysis") ||
    description.includes("calculation") ||
    description.includes("data")
  ) {
    return "analysis";
  }

  // Execution tools - execute, send, perform actions, API calls
  if (
    name.includes("execute") ||
    name.includes("send") ||
    name.includes("perform") ||
    description.includes("action") ||
    description.includes("execute") ||
    description.includes("api")
  ) {
    return "execution";
  }

  // Default to planning for complex tools that might need multiple capabilities
  return "planning";
}

/**
 * Get tools for a specific agent type (automatic categorization)
 */
function getToolsForAgent(agentType: AgentType) {
  return toolset.filter((tool) => categorizeTool(tool) === agentType);
}

/**
 * Manual tool categorization (for specific overrides)
 */
const manualToolCategories: Record<AgentType, string[]> = {
  research: [
    "retrieveRelevantChunks", // Document search
    "tavilySearch", // Web search
  ],
  analysis: [
    "getCurrentDateTime", // Time analysis
  ],
  execution: [
    "getCurrentWeather", // Weather API
  ],
  planning: [
    // Planning gets access to ALL tools for comprehensive planning
    "retrieveRelevantChunks",
    "tavilySearch",
    "getCurrentDateTime",
    "getCurrentWeather",
  ],
};

/**
 * Get tools for a specific agent type (with manual overrides)
 */
function getToolsForAgentWithOverrides(agentType: AgentType) {
  // Use manual categorization if available, otherwise use automatic
  const manualTools = manualToolCategories[agentType] || [];
  const autoTools = toolset.filter(
    (tool) => categorizeTool(tool) === agentType,
  );

  // Combine manual and automatic tools, removing duplicates
  const allTools = [...manualTools, ...autoTools];
  const uniqueTools = allTools.filter((tool, index, self) => {
    if (typeof tool === "string") {
      return (
        self.findIndex((t) => (typeof t === "string" ? t : t.name) === tool) ===
        index
      );
    }
    return (
      self.findIndex(
        (t) => (typeof t === "string" ? t : t.name) === tool.name,
      ) === index
    );
  });

  // Convert string tool names to actual tool objects
  return uniqueTools
    .map((tool) => {
      if (typeof tool === "string") {
        return toolset.find((t) => t.name === tool) || tool;
      }
      return tool;
    })
    .filter((tool) => tool !== undefined) as any[];
}

/**
 * Optimized supervisor prompt - focuses on high-level capabilities only
 */
const SUPERVISOR_PROMPT = `You are a supervisor agent that routes tasks to specialized agents.

Available agents and their high-level capabilities:

RESEARCH AGENT:
- Information gathering and search operations
- Document analysis and web search
- Data retrieval and content discovery
- Personal information from user's documents
- Facts about people, addresses, personal details
- ANY information that might be in user's uploaded documents

ANALYSIS AGENT:
- Data analysis and calculations
- Statistical processing and reasoning
- Time-based analysis and computations
- Mathematical calculations and formulas
- Current date and time queries
- Time calculations and date operations

EXECUTION AGENT:
- Taking actions and API interactions
- Task execution and automation
- External service interactions

PLANNING AGENT:
- Strategic planning and workflow design
- Multi-step process orchestration
- Complex task breakdown and coordination

IMPORTANT ROUTING RULES:
- ANY question about personal information, people, addresses, facts from documents → RESEARCH AGENT
- Questions about "age of", "tell me about", "what is", "find information about" → RESEARCH AGENT
- Questions about specific names, people, personal details → RESEARCH AGENT
- Questions about current date, time, "what day is it", "current date" → ANALYSIS AGENT
- Mathematical calculations, formulas, or complex analysis → ANALYSIS AGENT
- Only mathematical calculations, formulas, or complex analysis → ANALYSIS AGENT

Analyze the user's request and respond with ONLY the agent name (research, analysis, execution, or planning).

Examples:
- "Find information about..." → research
- "What is the age of..." → research
- "Tell me about..." → research
- "Current date?" → analysis
- "What time is it?" → analysis
- "What day is today?" → analysis
- "Calculate..." → analysis  
- "Execute..." → execution
- "Plan..." → planning
- "How to..." → planning`;

/**
 * Modular planning - breaks complex plans across multiple agents
 */
async function executeModularPlan(
  messages: BaseMessage[],
  supervisorLLM: any,
  createSpecializedAgent: (agentType: AgentType) => any,
) {
  // First, create a high-level plan
  const planningResponse = await supervisorLLM.invoke([
    {
      role: "system",
      content: `You are a planning coordinator. Break down complex tasks into modular steps.
      
      For each step, specify:
      1. The agent type (research, analysis, execution)
      2. The specific action needed
      3. Any dependencies on previous steps
      
      Respond with a JSON array of steps.`,
    },
    ...messages,
  ]);

  try {
    const plan = JSON.parse(planningResponse.content);
    const results = [];

    // Execute each step with the appropriate agent
    for (const step of plan) {
      const agent = createSpecializedAgent(step.agent);
      const stepResult = await agent.invoke({
        messages: [
          ...messages,
          { role: "system", content: `Execute step: ${step.action}` },
        ],
      });
      results.push(stepResult);
    }

    return {
      messages: [
        {
          role: "assistant",
          content: `[Modular Planning] Completed ${plan.length} steps: ${results.map((r) => r.messages[0]?.content).join("; ")}`,
        },
      ],
    };
  } catch (error) {
    // Fallback to single agent if planning fails
    console.log(
      "[DEBUG] Modular planning failed, falling back to single agent",
    );
    return null;
  }
}

/**
 * Optimized Supervisor Agent - Handles large tool counts efficiently
 */
export function createSupervisorAgent(useFallback = false) {
  const supervisorLLM = useFallback
    ? getFallbackLLM()
    : getLLM("gemini-2.5-pro");

  // Create specialized agents with optimized tool access
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback
      ? getFallbackLLM()
      : getLLM(
          agentType === "analysis" || agentType === "planning"
            ? "gemini-2.5-pro"
            : "gemini-2.5-flash",
        );

    // Optimize tool selection for large tool counts
    let agentTools;
    if (agentType === "planning") {
      // Planning agent gets a subset of essential tools, not all tools
      agentTools = getEssentialTools();
    } else {
      agentTools = getToolsForAgentWithOverrides(agentType);
    }

    console.log(
      `[DEBUG] ${agentType.toUpperCase()} Agent - Available tools:`,
      agentTools.map((t) => (typeof t === "string" ? t : t.name)),
    );

    return createReactAgent({
      llm: agentLLM,
      tools: agentTools,
    });
  };

  // Get essential tools for planning (subset of all tools)
  function getEssentialTools() {
    const essentialToolNames = [
      "retrieveRelevantChunks",
      "tavilySearch",
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter((tool) => essentialToolNames.includes(tool.name));
  }

  // Create all specialized agents
  const researchAgent = createSpecializedAgent("research");
  const analysisAgent = createSpecializedAgent("analysis");
  const executionAgent = createSpecializedAgent("execution");
  const planningAgent = createSpecializedAgent("planning");

  // Main supervisor function with optimized prompt
  const supervisor = async (
    messages: BaseMessage[],
    config?: { configurable?: { userId?: string } },
  ) => {
    const userId = config?.configurable?.userId;
    console.log("[DEBUG] Supervisor received userId:", userId);

    // Use optimized prompt (no detailed tool descriptions)
    const routingResponse = await supervisorLLM.invoke([
      {
        role: "system",
        content: SUPERVISOR_PROMPT,
      },
      ...messages,
    ]);

    const agentChoice =
      typeof routingResponse.content === "string"
        ? routingResponse.content.toLowerCase().trim()
        : "";

    // Validate agent choice
    const validAgents: AgentType[] = [
      "research",
      "analysis",
      "execution",
      "planning",
    ];
    const selectedAgent =
      validAgents.find((agent) => agentChoice.includes(agent)) || "research";

    console.log(`[DEBUG] Supervisor routing to: ${selectedAgent} agent`);

    // Check if this is a complex planning task that needs modular execution
    const userMessage = messages[messages.length - 1]?.content || "";
    const userMessageStr = typeof userMessage === "string" ? userMessage : "";
    const isComplexPlanning =
      selectedAgent === "planning" &&
      (userMessageStr.includes("complex") ||
        userMessageStr.includes("multiple steps") ||
        userMessageStr.includes("workflow"));

    if (isComplexPlanning) {
      console.log("[DEBUG] Using modular planning for complex task");
      const modularResult = await executeModularPlan(
        messages,
        supervisorLLM,
        (agentType) => createSpecializedAgent(agentType, userId),
      );
      if (modularResult) {
        return modularResult;
      }
    }

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({
          messages,
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({
          messages,
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({
          messages,
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({
          messages,
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({
          messages,
        });
    }

    // Extract the final response
    const finalMessage =
      agentResponse.messages && agentResponse.messages.length > 0
        ? agentResponse.messages[agentResponse.messages.length - 1]?.content ||
          `${selectedAgent} task completed`
        : `${selectedAgent} task completed`;

    return {
      messages: [
        {
          role: "assistant",
          content: `[${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent] ${finalMessage}`,
        },
      ],
    };
  };

  return supervisor;
}

/**
 * Enhanced Supervisor with Dynamic Tool Routing
 * For handling 30+ tools efficiently
 */
export function createAdvancedSupervisorAgent(useFallback = false) {
  const supervisorLLM = useFallback
    ? getFallbackLLM()
    : getLLM("gemini-2.5-pro");

  // Create specialized agents with enhanced tool routing
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback
      ? getFallbackLLM()
      : getLLM(
          agentType === "analysis" || agentType === "planning"
            ? "gemini-2.5-pro"
            : "gemini-2.5-flash",
        );

    // Optimize tool selection for large tool counts
    let agentTools;
    if (agentType === "planning") {
      agentTools = getEssentialTools();
    } else {
      agentTools = getToolsForAgentWithOverrides(agentType);
    }

    console.log(
      `[DEBUG] ${agentType.toUpperCase()} Agent - Available tools:`,
      agentTools.map((t) => (typeof t === "string" ? t : t.name)),
    );

    return createReactAgent({
      llm: agentLLM,
      tools: agentTools,
    });
  };

  // Get essential tools for planning (subset of all tools)
  function getEssentialTools() {
    const essentialToolNames = [
      "retrieveRelevantChunks",
      "tavilySearch",
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter((tool) => essentialToolNames.includes(tool.name));
  }

  // Create all specialized agents
  const researchAgent = createSpecializedAgent("research");
  const analysisAgent = createSpecializedAgent("analysis");
  const executionAgent = createSpecializedAgent("execution");
  const planningAgent = createSpecializedAgent("planning");

  // Enhanced supervisor with tool-aware routing
  const supervisor = async (
    messages: BaseMessage[],
    config?: { configurable?: { userId?: string } },
  ) => {
    const userId = config?.configurable?.userId;
    console.log("[DEBUG] Advanced Supervisor received userId:", userId);

    const routingResponse = await supervisorLLM.invoke([
      {
        role: "system",
        content: SUPERVISOR_PROMPT,
      },
      ...messages,
    ]);

    const agentChoice =
      typeof routingResponse.content === "string"
        ? routingResponse.content.toLowerCase().trim()
        : "";
    const validAgents: AgentType[] = [
      "research",
      "analysis",
      "execution",
      "planning",
    ];
    const selectedAgent =
      validAgents.find((agent) => agentChoice.includes(agent)) || "research";

    console.log(
      `[DEBUG] Advanced Supervisor routing to: ${selectedAgent} agent with specialized tools`,
    );

    // Check for complex planning tasks
    const userMessage = messages[messages.length - 1]?.content || "";
    const userMessageStr = typeof userMessage === "string" ? userMessage : "";
    const isComplexPlanning =
      selectedAgent === "planning" &&
      (userMessageStr.includes("complex") ||
        userMessageStr.includes("multiple steps") ||
        userMessageStr.includes("workflow"));

    if (isComplexPlanning) {
      console.log("[DEBUG] Using modular planning for complex task");
      const modularResult = await executeModularPlan(
        messages,
        supervisorLLM,
        (agentType) => createSpecializedAgent(agentType, userId),
      );
      if (modularResult) {
        return modularResult;
      }
    }

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({
          messages,
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({
          messages,
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({
          messages,
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({
          messages,
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({
          messages,
        });
    }

    // Extract the final response
    const finalMessage =
      agentResponse.messages && agentResponse.messages.length > 0
        ? agentResponse.messages[agentResponse.messages.length - 1]?.content ||
          `${selectedAgent} task completed`
        : `${selectedAgent} task completed`;

    return {
      messages: [
        {
          role: "assistant",
          content: `[${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent] ${finalMessage}`,
        },
      ],
    };
  };

  return supervisor;
}

/**
 * Create a supervisor agent with tool-calling capabilities
 */
export function createToolCallingSupervisorAgent(useFallback = false) {
  const supervisorLLM = useFallback
    ? getFallbackLLM()
    : getLLM("gemini-2.5-pro");

  // Create specialized agents
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback
      ? getFallbackLLM()
      : getLLM(
          agentType === "analysis" || agentType === "planning"
            ? "gemini-2.5-pro"
            : "gemini-2.5-flash",
        );

    // Optimize tool selection for large tool counts
    let agentTools;
    if (agentType === "planning") {
      agentTools = getEssentialTools();
    } else {
      agentTools = getToolsForAgentWithOverrides(agentType);
    }

    return createReactAgent({
      llm: agentLLM,
      tools: agentTools,
    });
  };

  // Get essential tools for planning (subset of all tools)
  function getEssentialTools() {
    const essentialToolNames = [
      "retrieveRelevantChunks",
      "tavilySearch",
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter((tool) => essentialToolNames.includes(tool.name));
  }

  // Create all specialized agents
  const researchAgent = createSpecializedAgent("research");
  const analysisAgent = createSpecializedAgent("analysis");
  const executionAgent = createSpecializedAgent("execution");
  const planningAgent = createSpecializedAgent("planning");

  // Tool for routing to agents
  const routeToAgent = {
    name: "route_to_agent",
    description: "Route the task to a specialized agent",
    schema: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          enum: ["research", "analysis", "execution", "planning"],
          description: "The agent to route to",
        },
        reason: {
          type: "string",
          description: "Why this agent was chosen",
        },
      },
      required: ["agent", "reason"],
    },
    func: async (args: { agent: AgentType; reason: string }) => {
      console.log(
        `[DEBUG] Tool calling routing to: ${args.agent} agent - ${args.reason}`,
      );
      return `Routing to ${args.agent} agent: ${args.reason}`;
    },
  };

  // Supervisor with tool-calling for agent selection
  const supervisor = async (
    messages: BaseMessage[],
    config?: { configurable?: { userId?: string } },
  ) => {
    const userId = config?.configurable?.userId;
    console.log("[DEBUG] Tool Calling Supervisor received userId:", userId);

    const routingResponse = await supervisorLLM.invoke([
      {
        role: "system",
        content: SUPERVISOR_PROMPT,
      },
      ...messages,
    ]);

    // For now, use simple routing logic
    const agentChoice =
      typeof routingResponse.content === "string"
        ? routingResponse.content.toLowerCase().trim()
        : "";
    const validAgents: AgentType[] = [
      "research",
      "analysis",
      "execution",
      "planning",
    ];
    const selectedAgent =
      validAgents.find((agent) => agentChoice.includes(agent)) || "research";

    console.log(
      `[DEBUG] Tool Calling Supervisor routing to: ${selectedAgent} agent`,
    );

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({
          messages,
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({
          messages,
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({
          messages,
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({
          messages,
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({
          messages,
        });
    }

    // Extract the final response
    const finalMessage =
      agentResponse.messages && agentResponse.messages.length > 0
        ? agentResponse.messages[agentResponse.messages.length - 1]?.content ||
          `${selectedAgent} task completed`
        : `${selectedAgent} task completed`;

    return {
      messages: [
        {
          role: "assistant",
          content: `[${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent] ${finalMessage}`,
        },
      ],
    };
  };

  return supervisor;
}
