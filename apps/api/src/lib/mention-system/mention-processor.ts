// Mention Processor - Handles direct tool calls for mentions
import { toolset } from "../../tool/tool.index";
import {
  processMentionWithQueryModification,
  isDirectToolMention,
  processKeywordMentions,
} from "./mention-handler";

export interface ToolResult {
  mentionId: string;
  toolName: string;
  originalQuery: string;
  result: string;
  success: boolean;
}

export interface MentionProcessingResult {
  hasMentions: boolean;
  response: string;
  toolResults: ToolResult[];
}

/**
 * Process mentions in user query and execute direct tool calls
 */
export async function processMentionsInQuery(
  userQuery: string,
): Promise<MentionProcessingResult> {
  // Debug: Log all available tools at the start
  console.log(
    `[MENTION] All available tools: ${toolset.map((t) => t.name).join(", ")}`,
  );

  // First, process keyword mentions to convert them to proper mention IDs
  const processedQuery = processKeywordMentions(userQuery);

  // Check if query contains mention patterns (@mention) - support both single words and phrases
  const mentionPattern = /@([^@\s]+)/g;
  const mentions = processedQuery.match(mentionPattern);

  if (!mentions) {
    return {
      hasMentions: false,
      response: "",
      toolResults: [],
    };
  }

  console.log(`[MENTION] Found mentions: ${mentions.join(", ")}`);
  console.log(`[MENTION] Processed query: "${processedQuery}"`);

  const toolResults: ToolResult[] = [];
  const originalQuery = userQuery;
  let hasDirectToolMentions = false;

  for (const mention of mentions) {
    const mentionId = mention.replace("@", "");
    console.log(`[MENTION] Processing mention: ${mentionId}`);

    // Check if this is a direct tool mention (agent mention)
    const isDirectTool = isDirectToolMention(mentionId);

    if (!isDirectTool) {
      console.log(
        `[MENTION] Skipping document mention: ${mentionId} - will follow AI flow`,
      );
      continue; // Skip document mentions, let them follow normal AI flow
    }

    hasDirectToolMentions = true;

    // Process mention with query modification
    const processedMention = processMentionWithQueryModification(
      mentionId,
      processedQuery,
    );

    if (processedMention) {
      try {
        console.log(
          `[MENTION] Executing tool: ${processedMention.toolName} with query: "${processedMention.modifiedQuery}"`,
        );

        // Get the tool from toolset
        const tool = toolset.find((t) => t.name === processedMention.toolName);

        // Debug: Log available tools
        console.log(
          `[MENTION] Available tools: ${toolset.map((t) => t.name).join(", ")}`,
        );
        console.log(`[MENTION] Looking for tool: ${processedMention.toolName}`);
        console.log(`[MENTION] Tool found: ${tool ? "YES" : "NO"}`);

        // Debug: Check if tool exists by name
        const toolNames = toolset.map((t) => t.name);
        const toolExists = toolNames.includes(processedMention.toolName);
        console.log(`[MENTION] Tool exists check: ${toolExists}`);
        console.log(`[MENTION] Tool names array: [${toolNames.join(", ")}]`);

        if (tool) {
          const result = await tool.invoke(processedMention.modifiedQuery);
          toolResults.push({
            mentionId,
            toolName: processedMention.toolName,
            originalQuery: processedMention.modifiedQuery,
            result: result,
            success: true,
          });
        } else {
          // Check if it's a missing API key issue
          let errorMessage = `❌ Tool ${processedMention.toolName} not found. Available tools: ${toolset.map((t) => t.name).join(", ")}`;

          if (processedMention.toolName === "youtubeSearch") {
            if (!process.env.YOUTUBE_API_KEY) {
              errorMessage =
                "❌ YouTube search requires YOUTUBE_API_KEY environment variable to be set. Please configure the YouTube API key to enable YouTube search functionality.";
            } else {
              errorMessage = `❌ YouTube search tool not available. Please check the tool configuration. Available tools: ${toolset.map((t) => t.name).join(", ")}`;
            }
          } else if (processedMention.toolName === "tavilySearch") {
            if (!process.env.TAVILY_API_KEY) {
              errorMessage =
                "❌ Web search requires TAVILY_API_KEY environment variable to be set. Please configure the Tavily API key to enable web search functionality.";
            } else {
              errorMessage = `❌ Web search tool not available. Please check the tool configuration. Available tools: ${toolset.map((t) => t.name).join(", ")}`;
            }
          }

          toolResults.push({
            mentionId,
            toolName: processedMention.toolName,
            originalQuery: processedMention.modifiedQuery,
            result: errorMessage,
            success: false,
          });
        }
      } catch (error) {
        console.error(
          `[MENTION] Error executing tool ${processedMention.toolName}:`,
          error,
        );
        toolResults.push({
          mentionId,
          toolName: processedMention.toolName,
          originalQuery: processedMention.modifiedQuery,
          result: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          success: false,
        });
      }
    } else {
      console.log(`[MENTION] No tool mapping found for mention: ${mentionId}`);
      toolResults.push({
        mentionId,
        toolName: "unknown",
        originalQuery: userQuery,
        result: `❌ Mention '@${mentionId}' not supported`,
        success: false,
      });
    }
  }

  // Only return direct tool results if we have agent mentions
  if (!hasDirectToolMentions) {
    console.log(
      "[MENTION] No direct tool mentions found, following normal AI flow",
    );
    return {
      hasMentions: false,
      response: "",
      toolResults: [],
    };
  }

  // Format beautiful response
  const formattedResponse = formatMentionResponse(originalQuery, toolResults);

  return {
    hasMentions: true,
    response: formattedResponse,
    toolResults,
  };
}

/**
 * Format mention results into a beautiful, user-friendly response
 */
function formatMentionResponse(
  originalQuery: string,
  toolResults: ToolResult[],
): string {
  let response = "🎯 **Direct Tool Execution Results**\n\n";
  response += `**Original Query:** ${originalQuery}\n\n`;

  const successfulResults = toolResults.filter((r) => r.success);
  const failedResults = toolResults.filter((r) => !r.success);

  if (successfulResults.length > 0) {
    response += "✅ **Successful Executions:**\n\n";

    successfulResults.forEach((result, index) => {
      const toolDisplayName = getToolDisplayName(result.toolName);
      response += `**${index + 1}. ${toolDisplayName}**\n`;
      response += `🔍 Query: "${result.originalQuery}"\n\n`;
      response += `${result.result}\n\n`;
      response += "---\n\n";
    });
  }

  if (failedResults.length > 0) {
    response += "❌ **Failed Executions:**\n\n";

    failedResults.forEach((result, index) => {
      const toolDisplayName = getToolDisplayName(result.toolName);
      response += `**${index + 1}. ${toolDisplayName}**\n`;
      response += `🔍 Query: "${result.originalQuery}"\n`;
      response += `❌ Error: ${result.result}\n\n`;
    });
  }

  // Add summary
  response += `📊 **Summary:** ${successfulResults.length} successful, ${failedResults.length} failed\n`;
  response += "⚡ *Executed via direct tool calls*";

  return response;
}

/**
 * Get user-friendly display names for tools
 */
function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    tavilySearch: "🌐 Web Search",
    youtubeSearch: "🎥 YouTube Search",
    retrieveRelevantChunks: "📄 Document Search",
    getCurrentDateTime: "🕐 Time & Date",
    getCurrentWeather: "🌤️ Weather Info",
  };

  return displayNames[toolName] || `🔧 ${toolName}`;
}
