// YouTube Search Tool using YouTube Data API v3
interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

/**
 * Performs a YouTube search using YouTube Data API v3.
 * @param query The search query
 * @param apiKey Your YouTube Data API key
 * @param maxResults Optional maximum number of results (default: 5)
 * @returns YouTube search results with video information
 */
export async function youtubeSearch(
  query: string,
  apiKey: string,
  maxResults = 5,
): Promise<YouTubeSearchResponse> {
  const url = `https://www.googleapis.com/youtube/v3/search`;

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: maxResults.toString(),
    key: apiKey,
    order: "relevance",
  });

  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Formats YouTube search results into a readable string
 * @param results YouTube search results
 * @returns Formatted string with video information
 */
export function formatYouTubeResults(results: YouTubeSearchResponse): string {
  if (!results.items || results.items.length === 0) {
    return "No YouTube videos found for your search query.";
  }

  let formatted = `🎥 **YouTube Search Results** (${results.pageInfo.totalResults} total results)\n\n`;

  results.items.forEach((item, index) => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const channel = item.snippet.channelTitle;
    const publishedAt = new Date(item.snippet.publishedAt).toLocaleDateString();
    const description =
      item.snippet.description.substring(0, 150) +
      (item.snippet.description.length > 150 ? "..." : "");
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    formatted += `${index + 1}. **${title}**\n`;
    formatted += `   📺 Channel: ${channel}\n`;
    formatted += `   📅 Published: ${publishedAt}\n`;
    formatted += `   🔗 URL: ${videoUrl}\n`;
    formatted += `   📝 Description: ${description}\n\n`;
  });

  return formatted;
}

/**
 * Enhanced YouTube search with additional metadata
 * @param query Search query
 * @param apiKey YouTube API key
 * @param maxResults Number of results
 * @returns Enhanced search results with video details
 */
export async function enhancedYouTubeSearch(
  query: string,
  apiKey: string,
  maxResults = 5,
): Promise<string> {
  try {
    // Check if query contains a YouTube URL
    const youtubeUrlMatch = query.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    );

    if (youtubeUrlMatch) {
      // Extract video ID and get video details
      const videoId = youtubeUrlMatch[1];
      return await getVideoDetails(videoId, apiKey);
    }

    // Clean the query by removing mention patterns
    const cleanQuery = query.replace(/@[^\s]+/g, "").trim();

    if (!cleanQuery) {
      return "Please provide a search query for YouTube videos.";
    }

    const searchResults = await youtubeSearch(cleanQuery, apiKey, maxResults);
    return formatYouTubeResults(searchResults);
  } catch (error) {
    console.error("[ERROR] YouTube search failed:", error);
    return `YouTube search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Get detailed information about a specific YouTube video
 * @param videoId YouTube video ID
 * @param apiKey YouTube API key
 * @returns Video details
 */
async function getVideoDetails(
  videoId: string,
  apiKey: string,
): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/videos`;

  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id: videoId,
    key: apiKey,
  });

  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return `❌ Video not found or unavailable: ${videoId}`;
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const statistics = video.statistics;
  const contentDetails = video.contentDetails;

  let result = `🎥 **Video Details**\n\n`;
  result += `**Title:** ${snippet.title}\n`;
  result += `**Channel:** ${snippet.channelTitle}\n`;
  result += `**Published:** ${new Date(snippet.publishedAt).toLocaleDateString()}\n`;
  result += `**Duration:** ${formatDuration(contentDetails.duration)}\n`;
  result += `**Views:** ${parseInt(statistics.viewCount).toLocaleString()}\n`;
  result += `**Likes:** ${parseInt(statistics.likeCount || "0").toLocaleString()}\n`;
  result += `**URL:** https://www.youtube.com/watch?v=${videoId}\n\n`;
  result += `**Description:**\n${snippet.description.substring(0, 500)}${snippet.description.length > 500 ? "..." : ""}\n`;

  return result;
}

/**
 * Format YouTube duration (ISO 8601 format) to readable format
 * @param duration Duration in ISO 8601 format (PT4M13S)
 * @returns Formatted duration string
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
