import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "./llm";
import { BaseMessage } from "@langchain/core/messages";
import { SemanticToolRegistry } from "./semantic-tool-registry";

async function executeWithTools(tools: any[], messages: BaseMessage[], userId?: string, userQuery?: string) {
  const results: string[] = [];
  
  // Execute ALL selected tools and collect results
  for (const tool of tools) {
    try {
      let toolResult = '';
      
      if (tool.name === 'getCurrentDateTime') {
        toolResult = await tool.invoke("Get current time and date", { configurable: { userId } });
        results.push(`🕐 **Current Time**: ${toolResult}`);
      }
      else if (tool.name === 'getCurrentWeather') {
        toolResult = await tool.invoke("Get current weather information", { configurable: { userId } });
        results.push(`🌤️ **Weather**: ${toolResult}`);
      }
      else if (tool.name === 'retrieveRelevantChunks') {
        toolResult = await tool.invoke(userQuery || "", { configurable: { userId } });
        results.push(`📄 **Document Analysis**: ${toolResult}`);
      }
      else if (tool.name === 'tavilySearch') {
        toolResult = await tool.invoke(userQuery || "", { configurable: { userId } });
        results.push(`🔍 **Search Results**: ${toolResult}`);
      }
      
    } catch (error) {
      console.error(`[ERROR] ${tool.name} failed:`, error);
      results.push(`❌ **${tool.name}**: Failed to execute`);
    }
  }
  
  // Combine all results
  if (results.length > 0) {
    return {
      content: results.join('\n\n'),
      tokenUsage: 0
    };
  }

  // Fallback to LLM for other queries
  const agentLLM = getLLM("gemini-2.5-flash");
  const agent = createReactAgent({
    llm: agentLLM,
    tools: tools,
  });

  const systemMessage = {
    role: "system",
    content: `You are a helpful AI assistant with access to these tools: ${tools.map(t => t.name).join(', ')}. 
    Use the appropriate tools to answer the user's question. Be direct and helpful.`
  };

  const result = await agent.invoke({
    messages: [systemMessage, ...messages]
  });

  const responseContent = typeof result.messages[0]?.content === 'string'
    ? result.messages[0].content
    : 'Task completed successfully.';

  return {
    content: responseContent,
    tokenUsage: 0
  };
}

export function createSemanticSupervisor(useFallback = false) {
  const semanticRegistry = new SemanticToolRegistry(toolset);
  const supervisorLLM = useFallback ? getFallbackLLM() : getLLM("gemini-2.5-pro");

  return async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
    const userId = config?.configurable?.userId;
    const userQuery = extractUserQuery(messages);
    const startTime = Date.now();

    try {
      console.log("[DEBUG] Using TRUE semantic tool selection");

      // SEMANTIC TOOL SELECTION (No keywords!)
      const selection = await semanticRegistry.selectToolsSemantically(userQuery, undefined, 3);
      
      console.log(`[DEBUG] Semantic selection:`, {
        method: selection.selectionMethod,
        tools: selection.tools.map(t => t.name),
        confidences: selection.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`),
        reasonings: selection.reasonings
      });

      if (selection.tools.length === 0) {
        return {
          messages: [{
            role: "assistant",
            content: "I'm not sure how to help with that request. Could you please rephrase or provide more details?"
          }],
          metadata: {
            source: "no_tools_found",
            processingTime: Date.now() - startTime,
            userId
          }
        };
      }

      // Execute with semantically selected tools using direct tool invocation
      const result = await executeWithTools(selection.tools, messages, userId, userQuery);

      // Record performance for learning
      await semanticRegistry.recordToolUsage(
        selection.tools[0].name, 
        userQuery, 
        true, // Assume success for now
        selection.confidenceScores[0]
      );

      return {
        messages: [{
          role: "assistant",
          content: result.content
        }],
        metadata: {
          toolsUsed: selection.tools.map(t => t.name),
          confidenceScores: selection.confidenceScores,
          selectionMethod: selection.selectionMethod,
          reasonings: selection.reasonings,
          source: "semantic_routing",
          processingTime: Date.now() - startTime,
          userId
        }
      };

    } catch (error) {
      console.error("[ERROR] Semantic supervisor failed:", error);
      
      // Ultimate fallback
      return {
        messages: [{
          role: "assistant",
          content: "I'm experiencing some technical difficulties. Please try rephrasing your request."
        }],
        metadata: {
          source: "error",
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime,
          userId
        }
      };
    }
  };
}

function extractUserQuery(messages: BaseMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  if (typeof lastMessage?.content === 'string') {
    return lastMessage.content;
  }
  return '';
}
