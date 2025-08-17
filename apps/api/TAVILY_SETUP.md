# Tavily Search Tool Setup

This project includes a Tavily search tool that allows the AI agent to search the web for current information.

## Getting a Tavily API Key

1. Go to [Tavily AI](https://tavily.com/)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

## Environment Configuration

Add the following to your `apps/server/.env` file:

```env
TAVILY_API_KEY=your_tavily_api_key_here
```

## Usage

The Tavily search tool will automatically be available to the AI agent when:
- The `TAVILY_API_KEY` environment variable is set
- Users ask for current information, news, or facts that require web search

## Features

- **Web Search**: Search for current information, news, and facts
- **Basic Search**: Fast, general web search (default)
- **Advanced Search**: More comprehensive search with deeper analysis
- **Formatted Results**: Clean, readable search results with titles, URLs, and content snippets

## Example Queries

The AI agent can now handle queries like:
- "What's the latest news about AI?"
- "Current stock price of Apple"
- "Recent research on climate change"
- "Latest updates on [any topic]"

## Error Handling

If the Tavily API key is not configured, the tool will return a helpful message asking for the API key to be set up.

If the search fails for any reason, the tool will return an error message with details about what went wrong. 