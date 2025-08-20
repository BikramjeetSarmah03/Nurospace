// Tool: Tavily search for web content (requires API key)
import fetch from "node-fetch";

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
  query: string;
  search_depth: string;
  max_results: number;
}

/**
 * Performs a web search using Tavily API.
 * @param query The search query
 * @param apiKey Your Tavily API key
 * @param searchDepth Optional search depth ('basic' or 'advanced')
 * @param maxResults Optional maximum number of results (default: 5)
 * @returns Search results with titles, URLs, and content snippets
 */
export async function tavilySearch(
  query: string,
  apiKey: string,
  searchDepth: "basic" | "advanced" = "basic",
  maxResults = 5,
): Promise<TavilySearchResponse> {
  const url = "https://api.tavily.com/search";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: searchDepth,
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Formats search results into a readable string
 * @param results Tavily search results
 * @returns Formatted string with search results
 */
export function formatSearchResults(results: TavilySearchResult[]): string {
  if (!results || results.length === 0) {
    return "No search results found.";
  }

  const formattedResults = results
    .map((result, index) => {
      return `${index + 1}. **${result.title}**
   URL: ${result.url}
   Content: ${result.content.substring(0, 200)}${result.content.length > 200 ? "..." : ""}
   Relevance Score: ${result.score.toFixed(2)}`;
    })
    .join("\n\n");

  return `Search Results:\n\n${formattedResults}`;
}
