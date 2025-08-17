// tools/index.ts
import { DynamicTool } from "@langchain/core/tools";
import { getCurrentWeather } from "./weatherTool";
import { getCurrentDateTime } from "./currentDateTool";
import { retrieveRelevantChunksTool } from "./retrieveRelevantChunks";
import { tavilySearch, formatSearchResults } from "./tavilySearchTool";

//schedule email tool

export const toolset = [
  retrieveRelevantChunksTool,

  new DynamicTool({
    name: "getCurrentWeather",
    description:
      "Use this tool when the user asks about weather conditions or current weather in a specific city. Input should be a city name (e.g., 'Mumbai', 'New York', 'London').",
    func: async (input: string) => {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");
      const res = await getCurrentWeather(input, apiKey);
      return `Weather in ${res.city}: ${res.description}, ${res.temperature}°C`;
    },
  }),

  new DynamicTool({
    name: "getCurrentDateTime",
    description:
      "Use this tool when the user asks about the current date, time, or what day it is today. This tool provides the current date and time with timezone information. No input required.",
    func: async (_input: string) => {
      const res = getCurrentDateTime();
      return `Current Date: ${res.date}\nCurrent Time: ${res.time}\nTimezone: ${res.timezone}\nISO: ${res.iso}`;
    },
  }),

  new DynamicTool({
    name: "tavilySearch",
    description:
      "Use this tool when the user asks for current information, news, or facts that require searching the web. This tool can search for recent information, news articles, research papers, or any current data that might not be in your training data. Input should be a search query (e.g., 'latest news about AI', 'current stock price of Apple', 'recent research on climate change').",
    func: async (input: string) => {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) {
        return "Tavily API key not configured. Please set TAVILY_API_KEY environment variable to enable web search functionality.";
      }
      try {
        const searchResults = await tavilySearch(input, apiKey, "basic", 5);
        return formatSearchResults(searchResults.results);
      } catch (error) {
        console.error("[ERROR] Tavily search failed:", error);
        return `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  }),
];
