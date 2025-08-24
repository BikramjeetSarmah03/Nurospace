import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { toolset } from "@/tool/tool.index";
import { getLLM, getFallbackLLM } from "../llm";
import { BaseMessage } from "@langchain/core/messages";
import { SemanticToolRegistry } from "./semantic-tool-registry";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

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
        const rawChunks = await tool.invoke(userQuery || "", { configurable: { userId } });
        
        // ✅ PRODUCTIFY APPROACH: Return raw chunks, let main LLM process them
        if (rawChunks && rawChunks.length > 0) {
          results.push(`📄 **Document Analysis**: ${rawChunks}`);
        } else {
          results.push(`📄 **Document Analysis**: No relevant information found in your documents.`);
        }
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
  // 🚀 LAZY LOADING: Only create SemanticToolRegistry when actually needed
  let semanticRegistry: SemanticToolRegistry | null = null;

  return async (messages: BaseMessage[], config?: { configurable?: { userId?: string } }) => {
    // Initialize SemanticToolRegistry only when this function is called
    if (!semanticRegistry) {
      console.log("[SEMANTIC] 🚀 Initializing SemanticToolRegistry for NORMAL mode...");
      semanticRegistry = new SemanticToolRegistry(toolset);
    }
    const userId = config?.configurable?.userId;
    const userQuery = extractUserQuery(messages);
    const startTime = Date.now();

    try {
      // ✅ SMART BYPASS: Handle simple queries without tool selection
      const simpleResponse = handleSimpleQuery(userQuery);
      if (simpleResponse) {
        return {
          messages: [{
            role: "assistant",
            content: simpleResponse
          }],
          metadata: {
            source: "simple_query_bypass",
            processingTime: Date.now() - startTime,
            userId,
            tokensUsed: 0
          }
        };
      }

      // SEMANTIC TOOL SELECTION (No keywords!)
      const selection = await semanticRegistry.selectToolsSemantically(userQuery, undefined, 3);

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
      const toolResult = await executeWithTools(selection.tools, messages, userId, userQuery);

      // ✅ PRODUCTIFY APPROACH: Process tool results with LLM
      const finalContent = await processToolResultsWithLLM(toolResult.content, userQuery);

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
          content: finalContent
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



/**
 * ✅ PRODUCTIFY APPROACH: Process tool results with LLM
 * This mimics productify's approach of using LLM to extract specific information
 */
export async function processToolResultsWithLLM(toolResults: string, userQuery: string): Promise<string> {
  try {
    const llm = getLLM("gemini-2.5-flash");
    
    // Create a focused prompt for processing tool results
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful AI assistant that processes tool results and provides focused answers.
        
        IMPORTANT INSTRUCTIONS:
        - Focus ONLY on the information the user is asking for
        - Be concise and direct in your response
        - If asking for a name, extract just the name
        - If asking for contact info, extract just the contact details
        - If asking for specific facts, extract just those facts
        - Do NOT include irrelevant information
        - Do NOT repeat the entire tool results
        
        For name queries: Extract and return just the person's name
        For contact queries: Extract and return just the contact information
        For fact queries: Extract and return just the relevant facts`
      ],
      [
        "user", 
        `Tool Results:\n{context}\n\nUser Question: {question}\n\nProvide a focused answer based on the tool results:`
      ]
    ]);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ 
      context: toolResults, 
      question: userQuery 
    });

    return result;
  } catch (error) {
    console.error("[ERROR] Failed to process tool results with LLM:", error);
    
    // Return raw tool results if LLM processing fails
    return toolResults;
  }
}

/**
 * ✅ SMART BYPASS: Handle simple queries without tool selection or LLM processing
 * This saves tokens and provides instant responses for common greetings and simple queries
 */
function handleSimpleQuery(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Greetings and simple responses
  if (normalizedQuery === 'hi' || normalizedQuery === 'hello' || normalizedQuery === 'hey') {
    return "Hello! 👋 How can I help you today?";
  }
  
  if (normalizedQuery === 'how are you' || normalizedQuery === 'how are you doing') {
    return "I'm doing great, thank you! 😊 How can I assist you?";
  }
  
  if (normalizedQuery === 'thanks' || normalizedQuery === 'thank you' || normalizedQuery === 'thx') {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }
  
  if (normalizedQuery === 'bye' || normalizedQuery === 'goodbye' || normalizedQuery === 'see you') {
    return "Goodbye! 👋 Have a great day!";
  }
  
  if (normalizedQuery === 'help' || normalizedQuery === 'what can you do') {
    return "I can help you with:\n\n🔍 **Research**: Search the web and analyze documents\n⏰ **Analysis**: Get current time, weather, and information\n📄 **Documents**: Search and analyze your uploaded files\n🌐 **Web Search**: Find latest news and information\n\nWhat would you like to do?";
  }
  
  // Very short queries that don't need tools
  if (normalizedQuery.length <= 3) {
    return "Hi there! 👋 How can I help you today?";
  }
  
  // Questions about the AI itself
  if (normalizedQuery.includes('who are you') || normalizedQuery.includes('what are you')) {
    return "I'm Nurospace AI, your intelligent assistant! 🤖 I can help you with research, document analysis, web searches, and more. What would you like to work on?";
  }
  
  // Common conversational patterns that don't need tools
  if (normalizedQuery.includes('nice to meet you') || normalizedQuery.includes('pleasure to meet you')) {
    return "Nice to meet you too! 😊 I'm excited to help you with your tasks. What would you like to work on?";
  }
  
  if (normalizedQuery.includes('good morning') || normalizedQuery.includes('good afternoon') || normalizedQuery.includes('good evening')) {
    return `Good ${getTimeOfDay()}! 🌅 How can I assist you today?`;
  }
  
  if (normalizedQuery.includes('have a good day') || normalizedQuery.includes('have a nice day')) {
    return "Thank you! You too! 😊 Feel free to ask if you need anything else.";
  }
  
  // No simple response found - proceed with normal flow
  return null;
}

/**
 * Helper function to get time of day for greetings
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function extractUserQuery(messages: BaseMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  if (typeof lastMessage?.content === 'string') {
    return lastMessage.content;
  }
  return '';
}
