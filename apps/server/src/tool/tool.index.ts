// tools/index.ts
import { DynamicTool } from "@langchain/core/tools";
import { getCurrentWeather } from "./weatherTool";
import { getCurrentDateTime } from "./currentDateTool";

export const toolset = [
  new DynamicTool({
    name: "getCurrentWeather",
    description:
      "Returns the current weather for a city. Input should be a city name (e.g., 'Mumbai').",
    func: async (input: string) => {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");
      const res = await getCurrentWeather(input, apiKey);
      return `Weather in ${res.city}: ${res.description}, ${res.temperature}°C`;
    },
  }),

  new DynamicTool({
    name: "getCurrentDateTime",
    description: "Returns the current server date and time.",
    func: async (_input: string) => {
      const res = getCurrentDateTime();
      return `Date: ${res.date}, Time: ${res.time}`;
    },
  }),
];
