//supervisor-agent.ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM, ROUTING_FUNCTION_SCHEMA } from "./llm";
import { BaseMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";
import { createSemanticSupervisor } from "./semantic-supervisor";

// Cache for routing decisions
const routingCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Define specialized agents
export type AgentType = "research" | "analysis" | "execution" | "planning";

/**
 * Automatic tool categorization based on tool metadata
 */
function categorizeTool(tool: any): AgentType {
  const name = tool.name.toLowerCase();
  const description = (tool.description || '').toLowerCase();
  
  // Research tools - search, find, retrieve, gather information
  if (name.includes('search') || name.includes('find') || name.includes('retrieve') || 
      description.includes('search') || description.includes('find') || description.includes('gather')) {
    return 'research';
  }
  
  // Analysis tools - analyze, calculate, compute, process data
  if (name.includes('analyze') || name.includes('calculate') || name.includes('compute') || 
      description.includes('analysis') || description.includes('calculation') || description.includes('data')) {
    return 'analysis';
  }
  
  // Execution tools - execute, send, perform actions, API calls
  if (name.includes('execute') || name.includes('send') || name.includes('perform') || 
      description.includes('action') || description.includes('execute') || description.includes('api')) {
    return 'execution';
  }
  
  // Default to planning for complex tools that might need multiple capabilities
  return 'planning';
}

/**
 * Get tools for a specific agent type (automatic categorization)
 */
function getToolsForAgent(agentType: AgentType) {
  return toolset.filter(tool => categorizeTool(tool) === agentType);
}

/**
 * Manual tool categorization (for specific overrides)
 */
const manualToolCategories: Record<AgentType, string[]> = {
  research: [
    "retrieveRelevantChunks", // Document search
    "tavilySearch",           // Web search
  ],
  analysis: [
    "getCurrentDateTime",     // Time analysis
    "calculateAge",           // Age calculation
    "calculateDistance",      // Distance calculation
    "calculateBMI",           // BMI calculation
    "calculatePercentage",    // Percentage calculation
    "calculateMath",          // Mathematical calculations
    "generateRandomNumber",   // Random number generation
  ],
  execution: [
    "getCurrentWeather",      // Weather API
    "generatePassword",       // Password generation
    "generateUUID",           // UUID generation
  ],
  planning: [
    // Planning gets access to ALL tools for comprehensive planning
    "retrieveRelevantChunks",
    "tavilySearch", 
    "getCurrentDateTime",
    "getCurrentWeather",
    "calculateAge",
    "calculateDistance",
    "calculateBMI",
    "calculatePercentage",
    "calculateMath",
    "generateRandomNumber",
    "generatePassword",
    "generateUUID",
    "convertCurrency",
    "calculateEMI",
    "calculateSimpleInterest",
    "calculateCompoundInterest",
  ],
};

/**
 * Get tools for a specific agent type (with manual overrides)
 */
function getToolsForAgentWithOverrides(agentType: AgentType) {
  // Use manual categorization for specific tools
  const manualToolNames = manualToolCategories[agentType] || [];
  
  // Get tools by name from manual categorization
  const manualTools = toolset.filter(tool => 
    manualToolNames.includes(tool.name)
  );
  
  // Get additional tools by automatic categorization (excluding already included ones)
  const autoTools = toolset.filter(tool => {
    const isAlreadyIncluded = manualToolNames.includes(tool.name);
    const matchesCategory = categorizeTool(tool) === agentType;
    return !isAlreadyIncluded && matchesCategory;
  });
  
  // Combine and return unique tools
  return [...manualTools, ...autoTools];
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
async function executeModularPlan(messages: BaseMessage[], supervisorLLM: any, createSpecializedAgent: (agentType: AgentType) => any) {
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
        messages: [...messages, { role: "system", content: `Execute step: ${step.action}` }] 
      });
      results.push(stepResult);
    }

    return {
      messages: [
        {
          role: "assistant",
          content: `[Modular Planning] Completed ${plan.length} steps: ${results.map(r => r.messages[0]?.content).join('; ')}`,
        },
      ],
    };
  } catch (error) {
    // Fallback to single agent if planning fails
    console.log("[DEBUG] Modular planning failed, falling back to single agent");
    return null;
  }
}

/**
 * Optimized Supervisor Agent - Handles large tool counts efficiently
 */
export function createSupervisorAgent(useFallback = false) {
  const supervisorLLM = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  // Create specialized agents with optimized tool access
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback ? getFallbackLLM() : getLLM(
      agentType === "analysis" || agentType === "planning" ? "gemini-2.5-pro" : "gemini-2.5-flash"
    );
    
    // Optimize tool selection for large tool counts
    let agentTools;
    if (agentType === "planning") {
      // Planning agent gets a subset of essential tools, not all tools
      agentTools = getEssentialTools();
    } else {
      agentTools = getToolsForAgentWithOverrides(agentType);
    }
    
    console.log(`[DEBUG] ${agentType.toUpperCase()} Agent - Available tools:`, agentTools.map(t => typeof t === 'string' ? t : t.name));
    
    return createReactAgent({
      llm: agentLLM,
      tools: agentTools,
    });
  };

  // Get essential tools for planning (subset of all tools)
  function getEssentialTools() {
    const essentialToolNames = [
      "retrieveRelevantChunksTool", // Nurospace tool name
      "tavilySearch", 
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter(tool => essentialToolNames.includes(tool.name));
  }

  // Create all specialized agents
  const researchAgent = createSpecializedAgent("research");
  const analysisAgent = createSpecializedAgent("analysis");
  const executionAgent = createSpecializedAgent("execution");
  const planningAgent = createSpecializedAgent("planning");

  // Main supervisor function with optimized prompt
  const supervisor = async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
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

    const agentChoice = typeof routingResponse.content === 'string' ? routingResponse.content.toLowerCase().trim() : '';
    
    // Validate agent choice
    const validAgents: AgentType[] = ["research", "analysis", "execution", "planning"];
    const selectedAgent = validAgents.find(agent => agentChoice.includes(agent)) || "research";

    console.log(`[DEBUG] Supervisor routing to: ${selectedAgent} agent`);

    // Check if this is a complex planning task that needs modular execution
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageStr = typeof userMessage === 'string' ? userMessage : '';
    const isComplexPlanning = selectedAgent === "planning" && 
      (userMessageStr.includes("complex") || userMessageStr.includes("multiple steps") || userMessageStr.includes("workflow"));

    if (isComplexPlanning) {
      console.log("[DEBUG] Using modular planning for complex task");
      const modularResult = await executeModularPlan(messages, supervisorLLM, (agentType) => createSpecializedAgent(agentType, userId));
      if (modularResult) {
        return modularResult;
      }
    }

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({ 
          messages
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({ 
          messages
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({ 
          messages
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({ 
          messages
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({ 
          messages
        });
    }

    // Extract the final response
    const finalMessage = agentResponse.messages && agentResponse.messages.length > 0 
      ? agentResponse.messages[agentResponse.messages.length - 1]?.content || `${selectedAgent} task completed`
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
  const supervisorLLM = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  // Create specialized agents with enhanced tool routing
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback ? getFallbackLLM() : getLLM(
      agentType === "analysis" || agentType === "planning" ? "gemini-2.5-pro" : "gemini-2.5-flash"
    );
    
    // Optimize tool selection for large tool counts
    let agentTools;
    if (agentType === "planning") {
      agentTools = getEssentialTools();
    } else {
      agentTools = getToolsForAgentWithOverrides(agentType);
    }
    
    console.log(`[DEBUG] ${agentType.toUpperCase()} Agent - Available tools:`, agentTools.map(t => typeof t === 'string' ? t : t.name));
    
    return createReactAgent({
      llm: agentLLM,
      tools: agentTools,
    });
  };

  // Get essential tools for planning (subset of all tools)
  function getEssentialTools() {
    const essentialToolNames = [
      "retrieveRelevantChunksTool", // Nurospace tool name
      "tavilySearch", 
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter(tool => essentialToolNames.includes(tool.name));
  }

  // Create all specialized agents
  const researchAgent = createSpecializedAgent("research");
  const analysisAgent = createSpecializedAgent("analysis");
  const executionAgent = createSpecializedAgent("execution");
  const planningAgent = createSpecializedAgent("planning");

  // Enhanced supervisor with tool-aware routing
  const supervisor = async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
    const userId = config?.configurable?.userId;
    console.log("[DEBUG] Advanced Supervisor received userId:", userId);
    
    const routingResponse = await supervisorLLM.invoke([
      {
        role: "system",
        content: SUPERVISOR_PROMPT,
      },
      ...messages,
    ]);

    const agentChoice = typeof routingResponse.content === 'string' ? routingResponse.content.toLowerCase().trim() : '';
    const validAgents: AgentType[] = ["research", "analysis", "execution", "planning"];
    const selectedAgent = validAgents.find(agent => agentChoice.includes(agent)) || "research";

    console.log(`[DEBUG] Advanced Supervisor routing to: ${selectedAgent} agent with specialized tools`);

    // Check for complex planning tasks
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageStr = typeof userMessage === 'string' ? userMessage : '';
    const isComplexPlanning = selectedAgent === "planning" && 
      (userMessageStr.includes("complex") || userMessageStr.includes("multiple steps") || userMessageStr.includes("workflow"));

    if (isComplexPlanning) {
      console.log("[DEBUG] Using modular planning for complex task");
      const modularResult = await executeModularPlan(messages, supervisorLLM, (agentType) => createSpecializedAgent(agentType, userId));
      if (modularResult) {
        return modularResult;
      }
    }

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({ 
          messages
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({ 
          messages
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({ 
          messages
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({ 
          messages
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({ 
          messages
        });
    }

    // Extract the final response
    const finalMessage = agentResponse.messages && agentResponse.messages.length > 0 
      ? agentResponse.messages[agentResponse.messages.length - 1]?.content || `${selectedAgent} task completed`
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
  const supervisorLLM = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  // Create specialized agents
  const createSpecializedAgent = (agentType: AgentType, userId?: string) => {
    const agentLLM = useFallback ? getFallbackLLM() : getLLM(
      agentType === "analysis" || agentType === "planning" ? "gemini-2.5-pro" : "gemini-2.5-flash"
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
      "retrieveRelevantChunksTool",
      "tavilySearch", 
      "getCurrentDateTime",
      "getCurrentWeather",
    ];
    return toolset.filter(tool => essentialToolNames.includes(tool.name));
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
      console.log(`[DEBUG] Tool calling routing to: ${args.agent} agent - ${args.reason}`);
      return `Routing to ${args.agent} agent: ${args.reason}`;
    },
  };

  // Supervisor with tool-calling for agent selection
  const supervisor = async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
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
    const agentChoice = typeof routingResponse.content === 'string' ? routingResponse.content.toLowerCase().trim() : '';
    const validAgents: AgentType[] = ["research", "analysis", "execution", "planning"];
    const selectedAgent = validAgents.find(agent => agentChoice.includes(agent)) || "research";

    console.log(`[DEBUG] Tool Calling Supervisor routing to: ${selectedAgent} agent`);

    // Route to the appropriate agent with userId context
    let agentResponse;
    switch (selectedAgent) {
      case "research":
        agentResponse = await researchAgent.invoke({ 
          messages
        });
        break;
      case "analysis":
        agentResponse = await analysisAgent.invoke({ 
          messages
        });
        break;
      case "execution":
        agentResponse = await executionAgent.invoke({ 
          messages
        });
        break;
      case "planning":
        agentResponse = await planningAgent.invoke({ 
          messages
        });
        break;
      default:
        agentResponse = await researchAgent.invoke({ 
          messages
        });
    }

    // Extract the final response
    const finalMessage = agentResponse.messages && agentResponse.messages.length > 0 
      ? agentResponse.messages[agentResponse.messages.length - 1]?.content || `${selectedAgent} task completed`
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
 * 🚀 HYBRID SUPERVISOR AGENT - Function Calling + Caching + Fallback
 */
export function createHybridSupervisorAgent(useFallback = false) {
  const supervisorLLM = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  function generateCacheKey(query: string): string {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  async function smartFallback(query: string, messages: BaseMessage[], userId?: string) {
    console.log("[DEBUG] Using smart fallback");
    
    const needsResearch = query.includes('@') || query.includes('document') || query.includes('search');
    const needsBasic = query.includes('time') || query.includes('weather') || query.includes('date');
    
    let fallbackTools = [];
    
    if (needsResearch) {
      fallbackTools.push(toolset.find(t => t.name === 'retrieveRelevantChunks'));
      if (query.includes('web') || query.includes('news')) {
        fallbackTools.push(toolset.find(t => t.name === 'tavilySearch'));
      }
    }
    
    if (needsBasic) {
      if (query.includes('time') || query.includes('date')) {
        fallbackTools.push(toolset.find(t => t.name === 'getCurrentDateTime'));
      }
      if (query.includes('weather')) {
        fallbackTools.push(toolset.find(t => t.name === 'getCurrentWeather'));
      }
    }
    
    if (fallbackTools.length === 0) {
      fallbackTools = [toolset.find(t => t.name === 'getCurrentDateTime')];
    }

    const agentLLM = getFallbackLLM();
    const fallbackAgent = createReactAgent({
      llm: agentLLM,
      tools: fallbackTools.filter(Boolean) as any[],
    });

    const result = await fallbackAgent.invoke({ 
      messages
    });

    return {
      messages: [{
        role: "assistant",
        content: "I'm using a fallback approach: " + (typeof result.messages[0]?.content === 'string' ? result.messages[0].content : 'Task completed')
      }],
      metadata: {
        agent: "research",
        toolsUsed: fallbackTools.map(t => t?.name || 'unknown'),
        source: "fallback",
        confidence: 0.5,
        userId
      }
    };
  }

  // Helper function to safely extract user query
  function extractUserQuery(messages: BaseMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) return '';
    
    if (typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }
    
    if (Array.isArray(lastMessage.content)) {
      return lastMessage.content
        .map(item => typeof item === 'string' ? item : '')
        .join(' ')
        .trim();
    }
    
    return '';
  }

  async function executeWithTools(agentType: string, tools: any[], messages: BaseMessage[], userId?: string) {
    const userQuery = extractUserQuery(messages);
    
    // Direct tool execution based on agent type and query
    if (agentType === 'analysis' && userQuery.toLowerCase().includes('time')) {
      // Directly call getCurrentDateTime tool
      const timeTool = tools.find(t => t.name === 'getCurrentDateTime');
      if (timeTool) {
        try {
          const timeResult = await timeTool.invoke("Get current time and date", { configurable: { userId } });
          return {
            content: `The current time and date is: ${timeResult}`,
            tokenUsage: 0
          };
        } catch (error) {
          console.error("[ERROR] Time tool failed:", error);
          return {
            content: "I'm sorry, I couldn't retrieve the current time. Please try again.",
            tokenUsage: 0
          };
        }
      }
    } else if (agentType === 'execution' && userQuery.toLowerCase().includes('weather')) {
      // Directly call getCurrentWeather tool
      const weatherTool = tools.find(t => t.name === 'getCurrentWeather');
      if (weatherTool) {
        try {
          const weatherResult = await weatherTool.invoke("Get current weather information", { configurable: { userId } });
          return {
            content: `Current weather information: ${weatherResult}`,
            tokenUsage: 0
          };
        } catch (error) {
          console.error("[ERROR] Weather tool failed:", error);
          return {
            content: "I'm sorry, I couldn't retrieve the weather information. Please try again.",
            tokenUsage: 0
          };
        }
      }
    } else if (agentType === 'research' && userQuery.includes('@')) {
      // Directly call retrieveRelevantChunks tool
      const docTool = tools.find(t => t.name === 'retrieveRelevantChunks');
      if (docTool) {
        try {
          const docResult = await docTool.invoke(userQuery, { configurable: { userId } });
          return {
            content: `Based on your documents: ${docResult}`,
            tokenUsage: 0
          };
        } catch (error) {
          console.error("[ERROR] Document tool failed:", error);
          return {
            content: "I'm sorry, I couldn't retrieve the document information. Please try again.",
            tokenUsage: 0
          };
        }
      }
    } else if (agentType === 'research' && (userQuery.toLowerCase().includes('latest') || 
               userQuery.toLowerCase().includes('news') || userQuery.toLowerCase().includes('current') ||
               userQuery.toLowerCase().includes('recent') || userQuery.toLowerCase().includes('today') ||
               userQuery.toLowerCase().includes('any news'))) {
      // Directly call tavilySearch tool for latest information queries
      const searchTool = tools.find(t => t.name === 'tavilySearch');
      if (searchTool) {
        try {
          const searchResult = await searchTool.invoke(userQuery, { configurable: { userId } });
          return {
            content: `Here's the latest information: ${searchResult}`,
            tokenUsage: 0
          };
        } catch (error) {
          console.error("[ERROR] Search tool failed:", error);
          return {
            content: "I'm sorry, I couldn't retrieve the latest information. Please try again.",
            tokenUsage: 0
          };
        }
      }
    }
    
         // Handle general conversation without tools
     if (agentType === 'analysis' && (userQuery.toLowerCase().includes('hello') || 
         userQuery.toLowerCase().includes('hi') || userQuery.toLowerCase().includes('hey') ||
         userQuery.toLowerCase().trim().length < 10)) {
       return {
         content: "Hello! I'm Nurospace AI, your intelligent assistant. I can help you with time queries, document analysis, weather information, web searches, and much more. How can I assist you today?",
         tokenUsage: 0
       };
     }
     
     // Fallback to LLM for other queries with improved prompts
     const agentLLM = getLLM("gemini-2.5-flash");
     const agent = createReactAgent({
       llm: agentLLM,
       tools: tools,
     });

     const systemMessage = {
       role: "system",
       content: `You are a helpful ${agentType} assistant. Your role is to:

1. **Understand the user's request** and provide accurate, helpful responses
2. **Use available tools** when needed: ${tools.map(t => t.name).join(', ')}
3. **Provide clear, concise answers** without mentioning your system role
4. **Be conversational and friendly** while remaining professional
5. **If you can't help with a specific request**, suggest alternatives or ask for clarification

Remember: Focus on being helpful and informative, not on explaining your capabilities.`
     };

     const result = await agent.invoke({ 
       messages: [systemMessage, ...messages]
     });

     // Extract and clean the response
     const responseContent = typeof result.messages[0]?.content === 'string' 
       ? result.messages[0].content 
       : "I've processed your request. Is there anything specific you'd like to know more about?";

     // Remove system message artifacts
     const cleanedResponse = responseContent
       .replace(/You are a .*? assistant\./gi, '')
       .replace(/Your role is to:.*?Remember:.*$/gis, '')
       .replace(/Focus on being helpful.*$/gi, '')
       .trim();

     return {
       content: cleanedResponse || "I've completed the task. How else can I help you?",
       tokenUsage: 0
     };
  }

  return async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
    const userId = config?.configurable?.userId;
    const userQuery = extractUserQuery(messages);
    
    try {
      console.log("[DEBUG] Hybrid supervisor processing query");
      
      // Step 1: Check cache first (FAST PATH)
      const cacheKey = generateCacheKey(userQuery);
      const cachedDecision = routingCache.get(cacheKey);
      
      if (cachedDecision && 
          Date.now() - cachedDecision.timestamp < CACHE_TTL && 
          cachedDecision.confidence > 0.8) {
        console.log("[DEBUG] Using cached routing decision");
        const { agent, requiredTools } = cachedDecision;
        const selectedTools = toolset.filter(tool => requiredTools.includes(tool.name));
        const result = await executeWithTools(agent, selectedTools, messages, userId);
        
        return {
          messages: [{
            role: "assistant",
            content: `[${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent] ${typeof result.content === 'string' ? result.content : 'Task completed'}`
          }],
          metadata: {
            agent,
            toolsUsed: requiredTools,
            source: "cached",
            confidence: cachedDecision.confidence,
            userId
          }
        };
      }

      // Step 2: Smart routing with keyword analysis (OPTIMIZED PATH)
      console.log("[DEBUG] Using smart routing analysis");
      
      // Analyze query for routing decision
      const queryLower = (typeof userQuery === 'string' ? userQuery : '').toLowerCase();
      
      // Determine agent type based on keywords
      let agent = "research";
      let confidence = 0.8;
      let reasoning = "";
      let requiredTools = [];
      
      // Analysis agent triggers (PRIORITY - check time/date first)
      if (queryLower.includes('time') || queryLower.includes('date') || 
          queryLower.includes('what day') || queryLower.includes('current time') ||
          queryLower.includes('what time') || queryLower.includes('calculate') || 
          queryLower.includes('compute')) {
        agent = "analysis";
        reasoning = "Query involves calculations, time analysis, or data processing";
        requiredTools = ["getCurrentDateTime"];
      }
      // Research agent triggers (check after time/date)
      else if (queryLower.includes('@') || queryLower.includes('document') || 
          queryLower.includes('search') || queryLower.includes('find') ||
          queryLower.includes('tell me about') || queryLower.includes('what is') ||
          queryLower.includes('information about') || queryLower.includes('news') ||
          queryLower.includes('latest') || queryLower.includes('recent') ||
          (queryLower.includes('current') && !queryLower.includes('time'))) {
        agent = "research";
        reasoning = "Query involves information gathering, document analysis, or search";
        requiredTools = ["retrieveRelevantChunks"];
        
        if (queryLower.includes('web') || queryLower.includes('news') || queryLower.includes('latest') ||
            queryLower.includes('recent') || (queryLower.includes('current') && !queryLower.includes('time'))) {
          requiredTools.push("tavilySearch");
        }
      }
      // Execution agent triggers
      else if (queryLower.includes('weather') || queryLower.includes('execute') ||
               queryLower.includes('perform') || queryLower.includes('action')) {
        agent = "execution";
        reasoning = "Query involves API calls, weather data, or task execution";
        requiredTools = ["getCurrentWeather"];
      }
      // Planning agent triggers
      else if (queryLower.includes('plan') || queryLower.includes('workflow') ||
               queryLower.includes('strategy') || queryLower.includes('how to')) {
        agent = "planning";
        reasoning = "Query involves planning, strategy, or workflow design";
        requiredTools = ["getCurrentDateTime", "retrieveRelevantChunks"];
      }
      // Default fallback for general conversation
      else {
        agent = "analysis";
        confidence = 0.6;
        reasoning = "General conversation or greeting - routing to analysis agent";
        requiredTools = ["getCurrentDateTime"];
      }

      console.log(`[DEBUG] Routed to ${agent} agent (confidence: ${confidence})`);
      console.log(`[DEBUG] Required tools: ${requiredTools.join(', ')}`);

      // Step 3: Cache the decision for future use
      if (confidence > 0.7) {
        routingCache.set(cacheKey, {
          agent,
          confidence,
          reasoning,
          requiredTools,
          cacheKey,
          timestamp: Date.now(),
          usageCount: (routingCache.get(cacheKey)?.usageCount || 0) + 1
        });
      }

      // Step 4: Load only required tools
      const selectedTools = toolset.filter(tool => 
        requiredTools.includes(tool.name)
      );

      if (selectedTools.length === 0) {
        throw new Error("No required tools found");
      }

      // Step 5: Execute with selected tools
      const result = await executeWithTools(agent, selectedTools, messages, userId);

      return {
        messages: [{
          role: "assistant",
          content: `[${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent] ${typeof result.content === 'string' ? result.content : 'Task completed'}`
        }],
        metadata: {
          agent,
          confidence,
          reasoning,
          toolsUsed: requiredTools,
          source: "function_calling",
          tokenUsage: result.tokenUsage,
          userId
        }
      };

    } catch (error) {
      console.error("[ERROR] Hybrid supervisor failed:", error);
      
      // Step 6: Smart fallback with proper error handling
      try {
        return await smartFallback(userQuery, messages, userId);
      } catch (fallbackError) {
        console.error("[ERROR] Fallback also failed:", fallbackError);
        
        // Final fallback - return helpful error message
        return {
          messages: [{
            role: "assistant",
            content: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or rephrase your question."
          }],
          metadata: {
            agent: "system",
            toolsUsed: [],
            source: "error_fallback",
            confidence: 0,
            userId,
            error: error instanceof Error ? error.message : "Unknown error"
          }
        };
      }
    }
  };
}

/**
 * 🧠 SEMANTIC SUPERVISOR AGENT - AI-Powered Tool Selection with Ensemble Voting
 * 
 * Next-generation implementation with semantic understanding:
 * - Vector embeddings for true semantic matching
 * - Ensemble voting (semantic + keyword) for better accuracy
 * - Learning system for continuous improvement
 * - Performance tracking and optimization
 * - Fallback to keyword-based selection
 */
export function createSemanticSupervisorAgent(useFallback = false) {
  return createSemanticSupervisor(useFallback);
}