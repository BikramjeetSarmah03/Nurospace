// ✅ CENTRALIZED TOOL CONFIGURATION - Single Source of Truth
export interface ToolConfig {
  name: string;
  category: 'TIME_AND_DATE' | 'WEB_RESEARCH' | 'DOCUMENT_PROCESSING' | 'WEATHER_INFO' | 'CALCULATIONS' | 'COMMUNICATION';
  priority: number;
  description: string;
  usageExamples: string[];
  semanticContext: string;
  triggers: string[]; // For keyword matching
  tags?: string[];
  langchainDescription?: string; // For LangChain DynamicTool
}

export const TOOL_CONFIGS: ToolConfig[] = [
  {
    name: 'getCurrentDateTime',
    category: 'TIME_AND_DATE',
    priority: 10,
    description: 'Get current date and time information',
    usageExamples: [
      'what time is it right now',
      'current time please',
      'what day is today',
      'tell me the time',
      'current date and time',
      'what is todays date',
      'what time is it',
      'current time',
      'today date'
    ],
    semanticContext: 'time queries, what time is it, current time, current date, time right now, what day is today, clock time, date information, timestamp queries, time zone, current moment time checking, NOT web search, NOT document analysis, NOT weather information, NOT news search, NOT content analysis, ONLY time and date queries',
    triggers: ['time', 'date', 'current', 'now', 'today', 'clock', 'moment', 'hour', 'minute'],
    langchainDescription: 'Use this tool when the user asks about the current date, time, or what day it is today. This tool provides the current date and time with timezone information. No input required.'
  },
  {
    name: 'tavilySearch',
    category: 'WEB_RESEARCH',
    priority: 9,
    description: 'Search the web for current information and news',
    usageExamples: [
      'latest news about technology',
      'search for current events',
      'find information about',
      'what is happening in the world',
      'breaking news today',
      'search the internet for',
      'latest news',
      'breaking news',
      'search for information',
      'find news about',
      'age of Mark Zuckerberg',
      'who is Elon Musk',
      'when was Google founded'
    ],
    semanticContext: 'web search, internet search, latest news, breaking news, current events, search for information, find information online, news updates, web information, online research, search query, information lookup, biographical queries, factual information, NOT document analysis, NOT personal files, NOT time queries, NOT weather queries, ONLY web search and news',
    triggers: ['search', 'news', 'latest', 'breaking', 'find', 'information', 'web', 'internet', 'current', 'events', 'who is', 'age of', 'when was', 'how old'],
    langchainDescription: 'Use this tool when the user asks for current information, news, or facts that require searching the web. This tool can search for recent information, news articles, research papers, or any current data that might not be in your training data. Input should be a search query (e.g., "latest news about AI", "current stock price of Apple", "recent research on climate change").'
  },
  {
    name: 'retrieveRelevantChunks',
    category: 'DOCUMENT_PROCESSING',
    priority: 8,
    description: 'Analyze uploaded documents and personal files',
    usageExamples: [
      'analyze my uploaded document',
      'what does my document say',
      'search my personal files',
      'analyze the contract I uploaded',
      'find information in my document',
      '@doc123 analyze this',
      'my document says',
      'analyze my file',
      'search my documents',
      'what name is mentioned here',
      'who is this person',
      'find the name',
      'what does this document say about',
      'extract information from my document'
    ],
    semanticContext: 'document analysis, uploaded documents, personal documents, file analysis, document search, analyze document, document content, PDF analysis, my documents, uploaded files, document review, name extraction, personal information, biographical data, contact details, identifying information, NOT web search, NOT time queries, NOT weather queries, NOT general information, ONLY personal document analysis',
    triggers: ['document', 'file', 'uploaded', '@', 'my', 'analyze', 'content', 'pdf', 'personal', 'resume', 'contract', 'name', 'mention', 'who', 'person', 'extract'],
    langchainDescription: 'Use this tool when the user asks about their uploaded documents or personal files. This tool can search through and analyze uploaded PDFs, documents, and other files. It is especially useful for finding names, personal information, contact details, and biographical data within documents. Input should be a query about the document content.'
  },
  {
    name: 'getCurrentWeather',
    category: 'WEATHER_INFO',
    priority: 7,
    description: 'Get current weather information and forecasts',
    usageExamples: [
      'what is the weather like',
      'current weather conditions',
      'weather forecast for today',
      'will it rain today',
      'temperature right now',
      'weather in my area',
      'current weather',
      'weather today',
      'temperature forecast'
    ],
    semanticContext: 'weather conditions, temperature readings, precipitation forecast, climate data, atmospheric conditions, meteorological information, weather patterns, environmental conditions, seasonal forecasts, weather alerts, NOT time queries, NOT document analysis, NOT web search, NOT news, ONLY weather and climate information',
    triggers: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'climate', 'atmospheric'],
    langchainDescription: 'Use this tool when the user asks about weather conditions or current weather in a specific city. Input should be a city name (e.g., "Mumbai", "New York", "London").'
  }
];

// ✅ Category definitions for hierarchical selection
export const TOOL_CATEGORIES = {
  'TIME_AND_DATE': {
    name: 'TIME_AND_DATE',
    description: 'Time, date, scheduling, and temporal queries',
    tools: ['getCurrentDateTime'],
    examples: ['what time is it', 'current date', 'age calculation']
  },
  'WEB_RESEARCH': {
    name: 'WEB_RESEARCH',
    description: 'Internet search, news, factual information, biographical data',
    tools: ['tavilySearch'],
    examples: ['latest news', 'age of person', 'search information', 'who is someone']
  },
  'DOCUMENT_PROCESSING': {
    name: 'DOCUMENT_PROCESSING',
    description: 'Document analysis, file processing, personal document search',
    tools: ['retrieveRelevantChunks'],
    examples: ['analyze document', '@doc123', 'my uploaded file']
  },
  'WEATHER_INFO': {
    name: 'WEATHER_INFO',
    description: 'Weather forecasts and atmospheric conditions',
    tools: ['getCurrentWeather'],
    examples: ['weather today', 'temperature forecast', 'will it rain']
  }
} as const;

// ✅ Helper functions for tool management
export function getToolConfig(toolName: string): ToolConfig | undefined {
  return TOOL_CONFIGS.find(config => config.name === toolName);
}

export function getToolsByCategory(category: keyof typeof TOOL_CATEGORIES): ToolConfig[] {
  return TOOL_CONFIGS.filter(config => config.category === category);
}

export function getAllToolNames(): string[] {
  return TOOL_CONFIGS.map(config => config.name);
}

export function getToolTriggers(toolName: string): string[] {
  const config = getToolConfig(toolName);
  return config?.triggers || [];
}
