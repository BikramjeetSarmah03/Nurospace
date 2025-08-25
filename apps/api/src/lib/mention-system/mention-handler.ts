// Mention Handler for Processing Frontend Mention Options
import { toolset } from "../../tool/tool.index";

export interface MentionOption {
  id: string;
  name: string;
  type: string;
  description: string;
  category: "agent" | "files";
}

export interface ProcessedMention {
  toolName: string;
  query: string;
  context?: any;
}

/**
 * Maps frontend mention options to backend tools
 * This ensures frontend mention names match backend tool names
 * NOTE: Document mentions (@document_name) are excluded from direct tool calls
 */
const MENTION_TO_TOOL_MAP: Record<string, string> = {
  // Agent mentions - exact frontend names to backend tool names
  research: "tavilySearch",
  "search-workspace": "retrieveRelevantChunks",
  "search-web": "tavilySearch",
  "search-papers": "tavilySearch", // Can search for academic papers
  "search-youtube": "youtubeSearch",
  "complete-form": "retrieveRelevantChunks", // Can analyze forms in documents
  "create-citation": "tavilySearch", // Can search for citation info
  "create-flashcards": "retrieveRelevantChunks", // Can extract content for flashcards
};

/**
 * Keyword mappings for natural language mentions
 * Supports converting "@Search YouTube" to "@search-youtube"
 */
const KEYWORD_TO_MENTION_MAP: Record<string, string> = {
  // Multi-word keywords (longest first)
  "search youtube": "search-youtube",
  "search web": "search-web",
  "search workspace": "search-workspace",
  "search papers": "search-papers",
  "complete form": "complete-form",
  "create citation": "create-citation",
  "create flashcards": "create-flashcards",

  // Single-word keywords
  search: "search-web", // Default search
  youtube: "search-youtube",
  web: "search-web",
  research: "research",
  papers: "search-papers",
  workspace: "search-workspace",
  documents: "search-workspace",
  files: "search-workspace",
  citation: "create-citation",
  flashcards: "create-flashcards",
  form: "complete-form",
};

/**
 * Reverse mapping for validation - backend tool names to frontend mention names
 */
const TOOL_TO_MENTION_MAP: Record<string, string[]> = {
  tavilySearch: ["research", "search-web", "search-papers", "create-citation"],
  youtubeSearch: ["search-youtube"],
  retrieveRelevantChunks: [
    "search-workspace",
    "complete-form",
    "create-flashcards",
  ],
  getCurrentDateTime: [], // No direct mentions for time
  getCurrentWeather: [], // No direct mentions for weather
};

/**
 * Validate frontend-backend name matching
 */
export function validateMentionMapping(): {
  valid: boolean;
  issues: string[];
  mappings: Array<{ frontend: string; backend: string; status: string }>;
} {
  const issues: string[] = [];
  const mappings: Array<{ frontend: string; backend: string; status: string }> =
    [];

  // Check all frontend mentions have backend mappings
  for (const [frontendName, backendName] of Object.entries(
    MENTION_TO_TOOL_MAP,
  )) {
    const toolExists = toolset.some((tool) => tool.name === backendName);

    if (toolExists) {
      mappings.push({
        frontend: frontendName,
        backend: backendName,
        status: "✅ Valid",
      });
    } else {
      issues.push(
        `Frontend mention '${frontendName}' maps to non-existent backend tool '${backendName}'`,
      );
      mappings.push({
        frontend: frontendName,
        backend: backendName,
        status: "❌ Backend tool not found",
      });
    }
  }

  // Check all backend tools are accessible via mentions
  for (const tool of toolset) {
    const hasMentions = TOOL_TO_MENTION_MAP[tool.name]?.length > 0;
    if (!hasMentions) {
      mappings.push({
        frontend: "None",
        backend: tool.name,
        status: "⚠️ No frontend mentions",
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    mappings,
  };
}

/**
 * Process mention options from frontend and convert to backend tool calls
 */
export function processMentionOptions(
  mentionOptions: MentionOption[],
  userQuery: string,
): ProcessedMention[] {
  const processedMentions: ProcessedMention[] = [];

  for (const option of mentionOptions) {
    const toolName = MENTION_TO_TOOL_MAP[option.id];

    if (toolName) {
      // Check if the tool exists in our toolset
      const toolExists = toolset.some((tool) => tool.name === toolName);

      if (toolExists) {
        processedMentions.push({
          toolName,
          query: userQuery,
          context: {
            mentionType: option.type,
            mentionName: option.name,
            originalMentionId: option.id,
          },
        });
      }
    }
  }

  return processedMentions;
}

/**
 * Get available mention options for frontend
 */
export function getAvailableMentionOptions(): MentionOption[] {
  const availableTools = toolset.map((tool) => tool.name);

  const agentOptions: MentionOption[] = [
    {
      id: "research",
      name: "Research",
      type: "research",
      description: "Conduct comprehensive research",
      category: "agent",
    },
    {
      id: "search-workspace",
      name: "Search Workspace",
      type: "workspace",
      description: "Search through your workspace",
      category: "agent",
    },
    {
      id: "search-web",
      name: "Search Web",
      type: "web",
      description: "Search the internet for current information",
      category: "agent",
    },
    {
      id: "search-papers",
      name: "Search Papers",
      type: "papers",
      description: "Search academic papers and research",
      category: "agent",
    },
    {
      id: "search-youtube",
      name: "Search YouTube",
      type: "youtube",
      description: "Search YouTube for videos and content",
      category: "agent",
    },
    {
      id: "complete-form",
      name: "Complete Form",
      type: "form",
      description: "Automatically complete forms",
      category: "agent",
    },
    {
      id: "create-citation",
      name: "Create Citation",
      type: "citation",
      description: "Generate proper citations",
      category: "agent",
    },
    {
      id: "create-flashcards",
      name: "Create Flashcards",
      type: "flashcards",
      description: "Create study flashcards",
      category: "agent",
    },
  ];

  // Filter out options that don't have corresponding tools
  return agentOptions.filter((option) => {
    const toolName = MENTION_TO_TOOL_MAP[option.id];
    return toolName && availableTools.includes(toolName);
  });
}

/**
 * Process keyword mentions and convert them to proper mention IDs
 * Examples: "Search YouTube" -> "search-youtube", "Search Web" -> "search-web"
 */
export function processKeywordMentions(message: string): string {
  let processedMessage = message;

  // Sort keywords by length (longest first) to avoid partial matches
  const sortedKeywords = Object.keys(KEYWORD_TO_MENTION_MAP).sort(
    (a, b) => b.length - a.length,
  );

  for (const keyword of sortedKeywords) {
    // Use case-insensitive matching with word boundaries
    // Handle spaces properly in multi-word keywords
    const escapedKeyword = keyword
      .replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")
      .replace(/\s+/g, "\\\\s+");
    const mentionPattern = new RegExp(`@${escapedKeyword}(?=\\\\s|$)`, "gi");

    // Debug logging
    console.log(
      `[KEYWORD] Processing keyword: "${keyword}" -> "${KEYWORD_TO_MENTION_MAP[keyword]}"`,
    );
    console.log(`[KEYWORD] Pattern: /@${escapedKeyword}/gi`);
    console.log(`[KEYWORD] Before replace: "${processedMessage}"`);

    const beforeReplace = processedMessage;
    processedMessage = processedMessage.replace(
      mentionPattern,
      `@${KEYWORD_TO_MENTION_MAP[keyword]}`,
    );

    if (beforeReplace !== processedMessage) {
      console.log(`[KEYWORD] After replace: "${processedMessage}"`);
    }
  }

  return processedMessage;
}

/**
 * Check if a mention should be handled by direct tool calls
 * Document mentions (@document_name) should follow normal AI flow
 */
export function isDirectToolMention(mentionId: string): boolean {
  // Check if it's a document mention (not in our tool mapping)
  const isDocumentMention = !MENTION_TO_TOOL_MAP[mentionId];

  // Only agent mentions should use direct tool calls
  return !isDocumentMention;
}

/**
 * Enhanced mention processing with query modification
 * Only processes agent mentions, excludes document mentions
 */
export function processMentionWithQueryModification(
  mentionId: string,
  originalQuery: string,
): { toolName: string; modifiedQuery: string } | null {
  // Skip document mentions - they should follow normal AI flow
  if (!isDirectToolMention(mentionId)) {
    console.log(
      `[MENTION] Skipping document mention: ${mentionId} - will follow AI flow`,
    );
    return null;
  }

  const toolName = MENTION_TO_TOOL_MAP[mentionId];

  if (!toolName) {
    return null;
  }

  let modifiedQuery = originalQuery;

  // Modify query based on mention type
  switch (mentionId) {
    case "search-youtube":
      // Add YouTube-specific keywords if not present
      if (
        !originalQuery.toLowerCase().includes("video") &&
        !originalQuery.toLowerCase().includes("youtube") &&
        !originalQuery.toLowerCase().includes("tutorial")
      ) {
        modifiedQuery = `${originalQuery} video tutorial`;
      }
      break;

    case "search-papers":
      // Add academic keywords for paper search
      if (
        !originalQuery.toLowerCase().includes("research") &&
        !originalQuery.toLowerCase().includes("paper") &&
        !originalQuery.toLowerCase().includes("study")
      ) {
        modifiedQuery = `${originalQuery} research paper study`;
      }
      break;

    case "create-citation":
      // Add citation-specific keywords
      if (
        !originalQuery.toLowerCase().includes("citation") &&
        !originalQuery.toLowerCase().includes("reference")
      ) {
        modifiedQuery = `${originalQuery} citation reference`;
      }
      break;
  }

  return {
    toolName,
    modifiedQuery,
  };
}

/**
 * Validate if a mention option is supported
 */
export function isMentionSupported(mentionId: string): boolean {
  const toolName = MENTION_TO_TOOL_MAP[mentionId];
  if (!toolName) return false;

  return toolset.some((tool) => tool.name === toolName);
}
