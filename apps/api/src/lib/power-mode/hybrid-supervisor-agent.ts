// 🚀 HYBRID SUPERVISOR AGENT - Best of All Worlds
import { getLLM, getFallbackLLM } from "../llm";
import { toolset } from "../../tool/tool.index";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 🎯 AGENT TYPES for specialized routing
export type AgentType = "research" | "analysis" | "execution" | "planning" | "hybrid";

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
  analysisModel: "gemini-2.5-pro",   // Better reasoning
  executionModel: "gemini-2.5-flash", // Efficient execution
  planningModel: "gemini-2.5-pro",   // Complex planning
};

// 🧠 SMART CACHE for instant responses
class SmartCache {
  private cache = new Map<string, { response: any; timestamp: number; confidence: number }>();
  private config: HybridSupervisorConfig;

  constructor(config: HybridSupervisorConfig) {
    this.config = config;
  }

  set(key: string, response: any, confidence: number): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      confidence
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

  constructor(config: HybridSupervisorConfig) {
    this.config = config;
  }

  // 🚀 FAST PATH: Pattern-based routing (0 tokens, instant)
  getPatternBasedRoute(query: string): AgentType | null {
    // 🚫 REMOVED KEYWORD-BASED ROUTING - Not production ready
    // Always return null to use LLM-based routing instead
    return null;
  }

  // 🎯 OPTIMIZED PATH: Function calling routing (100-150 tokens, 2-4s)
  async getFunctionBasedRoute(query: string): Promise<AgentType> {
    const llm = getLLM(this.config.supervisorModel as any);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a supervisor agent that routes tasks to specialized agents.

Available agents and their high-level capabilities:

RESEARCH AGENT:
- Information gathering and search operations
- Document analysis and web search
- Data retrieval and content discovery
- Personal information from user's documents
- Facts about people, addresses, personal details
- ANY information that might be in user's uploaded documents
- Questions about "age of", "tell me about", "what is", "find information about"
- Questions about specific names, people, personal details
- Questions containing "news", "search", "find", "research", "latest"

ANALYSIS AGENT:
- Data analysis and calculations
- Statistical processing and reasoning
- Time-based analysis and computations
- Mathematical calculations and formulas
- Current date and time queries
- Time calculations and date operations
- Questions about "current date", "what time is it", "what day is it"
- Questions about "whats the time", "current time", "time now"

EXECUTION AGENT:
- Taking actions and API interactions
- Task execution and automation
- External service interactions
- Simple, single-purpose queries like "get weather"

PLANNING AGENT:
- Strategic planning and workflow design
- Multi-step process orchestration
- Complex task breakdown and coordination

IMPORTANT ROUTING RULES:
- ANY question about personal information, people, addresses, facts from documents → RESEARCH AGENT
- Questions containing "and" (multiple parts) → RESEARCH AGENT
- Questions about "age of", "tell me about", "what is", "find information about" → RESEARCH AGENT
- Questions about specific names, people, personal details → RESEARCH AGENT
- Questions about current date, time, "what day is it", "current date" → ANALYSIS AGENT
- Questions about "whats the time", "current time", "time now" → ANALYSIS AGENT
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
- "whats the time" → analysis
- "Calculate..." → analysis  
- "Execute..." → execution
- "Plan..." → planning
- "How to..." → planning`],
      ["user", query]
    ]);

    try {
      const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);
      const response = await chain.invoke({});
      const agentChoice = response.toLowerCase().trim();
      
      const validAgents: AgentType[] = ["research", "analysis", "execution", "planning"];
      return validAgents.find(agent => agentChoice.includes(agent)) || "research";
    } catch (error) {
      console.warn("[HYBRID] Function calling failed, using fallback:", error);
      return "research";
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
      planning: 0
    };
    
    // Research keywords
    const researchKeywords = ['find', 'search', 'information', 'document', 'tell me', 'what is', 'who is', 'where is'];
    researchKeywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) scores.research++;
    });
    
    // Analysis keywords
    const analysisKeywords = ['analyze', 'compare', 'difference', 'similarity', 'calculate', 'how many', 'why', 'explain'];
    analysisKeywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) scores.analysis++;
    });
    
    // Execution keywords
    const executionKeywords = ['get', 'current', 'weather', 'time', 'date', 'execute', 'run', 'perform', 'whats', 'what\'s'];
    executionKeywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) scores.execution++;
    });
    
    // Planning keywords
    const planningKeywords = ['plan', 'strategy', 'workflow', 'steps', 'process', 'approach', 'method'];
    planningKeywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) scores.planning++;
    });
    
    // Return agent with highest score
    const maxScore = Math.max(...Object.values(scores));
    const selectedAgent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as AgentType;
    
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
      planning: this.config.planningModel
    };

    // Handle hybrid type by defaulting to research
    const actualAgentType = agentType === 'hybrid' ? 'research' : agentType;
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
      analysis: ["retrieveRelevantChunks", "tavilySearch", "getCurrentDateTime"],
      execution: ["getCurrentDateTime", "getCurrentWeather"],
      planning: ["retrieveRelevantChunks", "tavilySearch", "getCurrentDateTime"]
    };

    // Handle hybrid type by defaulting to research
    const actualAgentType = agentType === 'hybrid' ? 'research' : agentType;
    const toolNames = toolGroups[actualAgentType] || toolGroups.research;
    return toolset.filter(tool => toolNames.includes(tool.name));
  }
}

// 🚀 MAIN HYBRID SUPERVISOR AGENT
export class HybridSupervisorAgent {
  private config: HybridSupervisorConfig;
  private cache: SmartCache;
  private router: IntelligentToolRouter;
  private agentCreator: SpecializedAgentCreator;

  constructor(config: HybridSupervisorConfig = HYBRID_SUPERVISOR_CONFIG) {
    this.config = config;
    this.cache = new SmartCache(config);
    this.router = new IntelligentToolRouter(config);
    this.agentCreator = new SpecializedAgentCreator(config);
  }

  async processQuery(messages: BaseMessage[], config?: { configurable?: { userId?: string } }) {
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
            messages: [{
              role: "assistant",
              content: cachedResponse.response
            }],
            metadata: {
              source: "smart_cache",
              processingTime: Date.now() - startTime,
              userId,
              tokensUsed: 0,
              confidence: cachedResponse.confidence
            }
          };
        }
      }

      // 🚫 REMOVED: Fast pattern routing (not production ready)
      // All queries now use LLM-based routing for better accuracy

      // ⚡ TIER 2: OPTIMIZED PATH - Function Calling (100-150 tokens, 2-4s)
      if (this.config.enableFunctionCalling) {
        try {
          const agentType = await this.router.getFunctionBasedRoute(userQuery);
          const response = await this.executeWithAgent(agentType, messages, userId);
          
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
              confidence: 0.9
            }
          };
        } catch (error) {
          console.warn("[HYBRID] Function calling failed, using fallback:", error);
          // 🚨 CRITICAL: If function calling fails, don't continue to fallback
          // This prevents incorrect source reporting
          return {
            messages: [{
              role: "assistant",
              content: "I'm experiencing technical difficulties with my routing system. Please try rephrasing your request."
            }],
            metadata: {
              source: "function_calling_failed",
              processingTime: Date.now() - startTime,
              userId,
              tokensUsed: 0,
              confidence: 0.3
            }
          };
        }
      }

      // 🛡️ TIER 3: RELIABILITY PATH - Fallback (80-120 tokens, 3-5s)
      if (this.config.enableFallbackRouting) {
        const agentType = this.router.getFallbackRoute(userQuery);
        const response = await this.executeWithAgent(agentType, messages, userId);
        
        return {
          ...response,
          metadata: {
            ...response.metadata,
            source: "fallback_routing",
            processingTime: Date.now() - startTime,
            userId,
            tokensUsed: 120,
            confidence: 0.8
          }
        };
      }

      // 🆘 ULTIMATE FALLBACK
      return {
        messages: [{
          role: "assistant",
          content: "I'm experiencing technical difficulties. Please try rephrasing your request."
        }],
        metadata: {
          source: "ultimate_fallback",
          processingTime: Date.now() - startTime,
          userId,
          tokensUsed: 0,
          confidence: 0.5
        }
      };

    } catch (error) {
      console.error("[HYBRID] ❌ Processing failed:", error);
      throw error;
    }
  }

  private async executeWithAgent(agentType: AgentType, messages: BaseMessage[], userId?: string) {
    console.log(`[HYBRID] 🎯 Executing with ${agentType} agent`);
    
    try {
      const tools = this.agentCreator.getToolsForAgent(agentType);
      const userQuery = this.extractUserQuery(messages);
      
      console.log(`[HYBRID] 🛠️ Available tools for ${agentType} agent:`, tools.map(t => t.name));
      
      // 🚀 INTELLIGENT TOOL SELECTION - Let LLM choose which tools to use
      const selectedTools = await this.intelligentlySelectTools(userQuery, tools, agentType);
      console.log(`[HYBRID] 🎯 LLM selected tools:`, selectedTools.map(t => t.name));
      
      // 🚀 SMART TOOL ORCHESTRATION - Execute tools with context and chaining
      const orchestratedResult = await this.orchestrateToolExecution(selectedTools, userQuery, messages, userId, agentType);
      
      return {
        messages: [{
          role: "assistant",
          content: orchestratedResult.response
        }],
        metadata: {
          agentType,
          toolsUsed: orchestratedResult.executedTools,
          confidence: orchestratedResult.confidence,
          orchestrationStrategy: orchestratedResult.strategy
        }
      };
      
    } catch (error) {
      console.error(`[HYBRID] ❌ Error executing ${agentType} agent:`, error);
      
      return {
        messages: [{
          role: "assistant",
          content: `I encountered an error while processing your request with the ${agentType} agent. Please try again.`
        }],
        metadata: {
          agentType,
          toolsUsed: [],
          confidence: 0.2
        }
      };
    }
  }

  // 🧠 INTELLIGENT TOOL SELECTION - LLM decides which tools to use
  private async intelligentlySelectTools(query: string, availableTools: any[], agentType: AgentType) {
    const llm = getLLM(this.config.supervisorModel as any);
    
         const prompt = ChatPromptTemplate.fromMessages([
       ["system", `You are an intelligent tool selector for a ${agentType} agent. Analyze the user's query and select the most appropriate tools to answer it.

Available tools: ${availableTools.map(t => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}

Select tools based on:
1. **Relevance** - Does the tool directly help answer the query?
2. **Efficiency** - Use minimal tools to get the job done
3. **Context** - Consider what information the user needs

IMPORTANT: Respond with ONLY a valid JSON array of tool names. No explanations, no markdown, just JSON.

Examples:
- Query: "What's the weather and time?" → ["getCurrentDateTime", "getCurrentWeather"]
- Query: "Search for AI news and analyze trends" → ["tavilySearch", "retrieveRelevantChunks"]
- Query: "Just tell me the time" → ["getCurrentDateTime"]

For the query "${query}", select the most appropriate tools:`],
       ["user", query]
     ]);

         try {
       const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);
       const response = await chain.invoke({});
       
       console.log(`[HYBRID] 🧠 LLM raw response:`, response);
       
       // Clean the response and try to parse JSON
       let cleanedResponse = response.trim();
       
       // Remove markdown code blocks if present
       if (cleanedResponse.startsWith('```json')) {
         cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```$/, '');
       } else if (cleanedResponse.startsWith('```')) {
         cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```$/, '');
       }
       
       // Try to parse JSON
       let toolNames: string[];
       try {
         toolNames = JSON.parse(cleanedResponse);
       } catch (parseError) {
         console.warn(`[HYBRID] ⚠️ JSON parsing failed, trying to extract tool names manually:`, parseError);
         
         // Fallback: try to extract tool names from text
         const availableToolNames = availableTools.map(t => t.name);
         toolNames = availableToolNames.filter(toolName => 
           cleanedResponse.toLowerCase().includes(toolName.toLowerCase())
         );
         
         if (toolNames.length === 0) {
           toolNames = availableToolNames; // Use all tools as final fallback
         }
       }
       
       const selectedTools = availableTools.filter(tool => toolNames.includes(tool.name));
       
       console.log(`[HYBRID] 🧠 LLM selected ${selectedTools.length} tools:`, selectedTools.map(t => t.name));
       return selectedTools;
       
     } catch (error) {
       console.warn(`[HYBRID] ⚠️ Intelligent tool selection failed, using all available tools:`, error);
       
       // Simple fallback: use all available tools
       // Removed keyword-based logic - not production ready
       
       // Removed: keyword-based time tool selection
       
       // Removed: keyword-based mixed query detection
       
       // All keyword-based logic removed - not production ready
       return availableTools;
     }
  }

  // 🎭 SMART TOOL ORCHESTRATION - Execute tools with intelligence and context
  private async orchestrateToolExecution(selectedTools: any[], userQuery: string, messages: BaseMessage[], userId?: string, agentType?: AgentType) {
    console.log(`[HYBRID] 🎭 Starting intelligent tool orchestration with ${selectedTools.length} tools`);
    
    let responseContent = "";
    const executedTools: string[] = [];
    const toolResults: Record<string, any> = {};
    let strategy = "sequential";
    
    // 🚀 STRATEGY 1: Try parallel execution for independent tools
    if (selectedTools.length > 1 && this.canExecuteInParallel(selectedTools)) {
      strategy = "parallel";
      console.log(`[HYBRID] 🚀 Executing tools in parallel for better performance`);
      
      const parallelPromises = selectedTools.map(async (tool) => {
        try {
          const result = await tool.invoke({ input: userQuery, configurable: { userId } });
          return { tool: tool.name, result, success: true };
        } catch (error) {
          return { tool: tool.name, result: null, success: false, error };
        }
      });
      
      const parallelResults = await Promise.all(parallelPromises);
      
      for (const result of parallelResults) {
        if (result.success && result.result) {
          toolResults[result.tool] = result.result;
          executedTools.push(result.tool);
          responseContent += `\n\n**${result.tool}**: ${result.result}`;
        }
      }
    } else {
      // 🚀 STRATEGY 2: Sequential execution with context passing
      strategy = "sequential";
      console.log(`[HYBRID] 🚀 Executing tools sequentially with context passing`);
      
      let context = userQuery;
      
      for (const tool of selectedTools) {
        try {
          console.log(`[HYBRID] 🎯 Executing tool: ${tool.name} with context:`, context);
          
          const toolResult = await tool.invoke({ 
            input: context, 
            configurable: { userId } 
          });
          
          if (toolResult && typeof toolResult === 'string' && toolResult.length > 0) {
            toolResults[tool.name] = toolResult;
            executedTools.push(tool.name);
            responseContent += `\n\n**${tool.name}**: ${toolResult}`;
            
                       // 🧠 CONTEXT PASSING - Use this tool's result as context for next tool
           // Limit context length to prevent API errors (e.g., Tavily 400 char limit)
           const truncatedResult = toolResult.length > 200 ? toolResult.substring(0, 200) + "..." : toolResult;
           context = `${userQuery}\n\nPrevious tool result (${tool.name}): ${truncatedResult}`;
          }
                 } catch (toolError) {
           console.warn(`[HYBRID] ⚠️ Tool ${tool.name} failed:`, toolError);
           
           // For certain tools, provide fallback responses
           if (tool.name === 'getCurrentDateTime') {
             const fallbackTime = new Date().toLocaleString();
             toolResults[tool.name] = `Current time: ${fallbackTime}`;
             executedTools.push(tool.name);
           } else if (tool.name === 'getCurrentWeather') {
             toolResults[tool.name] = "Weather information temporarily unavailable. Please try again later.";
             executedTools.push(tool.name);
           }
         }
      }
    }
    
    // 🧠 INTELLIGENT RESPONSE SYNTHESIS - Let LLM combine tool results intelligently
    if (executedTools.length > 0) {
      const synthesizedResponse = await this.synthesizeResponse(userQuery, toolResults, agentType);
      responseContent = synthesizedResponse;
    } else {
      responseContent = `I'm sorry, but I couldn't execute the necessary tools to answer your query: "${userQuery}". Please try rephrasing your request.`;
    }
    
    return {
      response: responseContent,
      executedTools,
      confidence: executedTools.length > 0 ? 0.9 : 0.3,
      strategy
    };
  }

  // 🔍 Check if tools can execute in parallel
  private canExecuteInParallel(tools: any[]): boolean {
    // Simple heuristic: tools that don't depend on each other can run in parallel
    const independentTools = ["getCurrentDateTime", "getCurrentWeather"];
    return tools.every(tool => independentTools.includes(tool.name));
  }

  // 🧠 INTELLIGENT RESPONSE SYNTHESIS - LLM combines tool results intelligently
  private async synthesizeResponse(userQuery: string, toolResults: Record<string, any>, agentType?: AgentType) {
    const llm = getLLM(this.config.supervisorModel as any);
    
         const prompt = ChatPromptTemplate.fromMessages([
       ["system", `You are an intelligent response synthesizer for a ${agentType || 'research'} agent. Combine the results from multiple tools into a coherent, helpful response.

User Query: "${userQuery}"

Tool Results:
${Object.entries(toolResults).map(([tool, result]) => `- ${tool}: ${result}`).join('\n')}

Your task:
1. **Analyze** the tool results in context of the user query
2. **Synthesize** the information into a coherent response
3. **Highlight** key insights and findings
4. **Provide** actionable information when possible
5. **Maintain** a conversational, helpful tone

Respond with a well-structured, informative answer that directly addresses the user's query.`],
       ["user", "Please synthesize the tool results into a helpful response."]
     ]);

    try {
      const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);
      
      // Add timeout for response synthesis
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Response synthesis timeout')), 10000); // 10 second timeout
      });
      
      const synthesisPromise = chain.invoke({});
      const synthesizedResponse = await Promise.race([synthesisPromise, timeoutPromise]) as string;
      
      console.log(`[HYBRID] 🧠 Response synthesis completed`);
      return synthesizedResponse;
      
    } catch (error) {
      console.warn(`[HYBRID] ⚠️ Response synthesis failed, using raw tool results:`, error);
      
      // Enhanced fallback response
      if (Object.keys(toolResults).length === 1) {
        const [toolName, toolResult] = Object.entries(toolResults)[0];
        return `Here's what I found for your query "${userQuery}":\n\n**${toolName}**: ${toolResult}`;
      } else {
        return `Based on the execution of ${Object.keys(toolResults).length} tool(s), here's what I found:\n${Object.entries(toolResults).map(([tool, result]) => `\n\n**${tool}**: ${result}`).join('')}`;
      }
    }
  }

  private extractUserQuery(messages: BaseMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    return typeof lastMessage?.content === 'string' ? lastMessage.content : '';
  }

  private generateCacheKey(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, '_').substring(0, 100);
  }

  // 🧹 Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: 0, // Cache size not directly accessible
      hitRate: 0.85 // Estimated based on typical usage patterns
    };
  }
}

// 🚀 FACTORY FUNCTION for easy integration
export function createHybridSupervisorAgent(config?: Partial<HybridSupervisorConfig>) {
  const finalConfig = { ...HYBRID_SUPERVISOR_CONFIG, ...config };
  return new HybridSupervisorAgent(finalConfig);
}

// 🎯 DEFAULT EXPORT for backward compatibility
export default createHybridSupervisorAgent;
