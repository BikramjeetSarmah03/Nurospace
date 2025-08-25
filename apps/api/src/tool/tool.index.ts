// ✅ CENTRALIZED TOOL INDEX - Using Single Source of Truth
import { DynamicTool } from "@langchain/core/tools";
import { getCurrentWeather } from "./analysis/weatherTool";
import { getCurrentDateTime } from "./analysis/currentDateTool";
import { retrieveRelevantChunksTool } from "./research/retrieveRelevantChunks";
import { tavilySearch, formatSearchResults } from "./research/tavilySearchTool";
import { enhancedYouTubeSearch } from "./research/youtubeSearchTool";
import { TOOL_CONFIGS } from "../lib/tool-config";

// ✅ Create tools dynamically from centralized config
function createDynamicTool(config: any) {
  return new DynamicTool({
    name: config.name,
    description: config.langchainDescription || config.description,
    func: async (input: string) => {
      // ✅ Route to appropriate tool function based on config
      switch (config.name) {
        case "getCurrentWeather": {
          const apiKey = process.env.OPENWEATHER_API_KEY;
          if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");
          const weatherRes = await getCurrentWeather(input, apiKey);
          return `Weather in ${weatherRes.city}: ${weatherRes.description}, ${weatherRes.temperature}°C`;
        }

        case "getCurrentDateTime": {
          const dateTimeRes = getCurrentDateTime();
          return `Current Date: ${dateTimeRes.date}\nCurrent Time: ${dateTimeRes.time}\nTimezone: ${dateTimeRes.timezone}\nISO: ${dateTimeRes.iso}`;
        }

        case "tavilySearch": {
          const tavilyApiKey = process.env.TAVILY_API_KEY;
          if (!tavilyApiKey) {
            return "Tavily API key not configured. Please set TAVILY_API_KEY environment variable to enable web search functionality.";
          }
          try {
            const searchResults = await tavilySearch(
              input,
              tavilyApiKey,
              "basic",
              5,
            );
            return formatSearchResults(searchResults.results);
          } catch (error) {
            console.error("[ERROR] Tavily search failed:", error);
            return `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
          }
        }

        case "youtubeSearch": {
          const youtubeApiKey = process.env.YOUTUBE_API_KEY;
          if (!youtubeApiKey) {
            return "YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable to enable YouTube search functionality.";
          }
          try {
            return await enhancedYouTubeSearch(input, youtubeApiKey, 5);
          } catch (error) {
            console.error("[ERROR] YouTube search failed:", error);
            return `YouTube search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
          }
        }

        case "retrieveRelevantChunks":
          // This tool is already a DynamicTool, so we'll include it separately
          return "Document retrieval tool - handled separately";

        default:
          throw new Error(`Unknown tool: ${config.name}`);
      }
    },
  });
}

// ✅ Generate tools from centralized config
const dynamicTools = TOOL_CONFIGS.filter(
  (config) => config.name !== "retrieveRelevantChunks",
) // Handle separately
  .map(createDynamicTool);

// ✅ Export the complete toolset
export const toolset = [
  retrieveRelevantChunksTool, // Special case - already a DynamicTool
  ...dynamicTools,
];

// ✅ Helper functions for tool management
export function getToolByName(name: string) {
  return toolset.find((tool) => tool.name === name);
}

export function getToolsByCategory(category: string) {
  const categoryTools = TOOL_CONFIGS.filter(
    (config) => config.category === category,
  );
  return categoryTools
    .map((config) => getToolByName(config.name))
    .filter(Boolean);
}

export function getAllToolNames() {
  return toolset.map((tool) => tool.name);
}
