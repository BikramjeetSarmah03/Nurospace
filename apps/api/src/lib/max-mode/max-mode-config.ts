// 🚀 MAX MODE CONFIGURATION - Advanced AI System Settings
export interface MaxModeConfig {
  // LLM Configuration
  llm: {
    primaryModel: string;
    fallbackModel: string;
    temperature: number;
    maxRetries: number;
    maxConcurrency: number;
  };
  
  // Tool Selection
  toolSelection: {
    confidenceThreshold: number;
    maxToolsPerQuery: number;
    enableMultiToolOrchestration: boolean;
    enableToolChaining: boolean;
  };
  
  // Processing Strategy
  processing: {
    enableQueryDecomposition: boolean;
    enableChainOfThought: boolean;
    enableMultiStepExecution: boolean;
    enableQualityAssurance: boolean;
    enableFactVerification: boolean;
  };
  
  // Response Quality
  responseQuality: {
    enableSourceAttribution: boolean;
    enableConfidenceScoring: boolean;
    enableUncertaintyHandling: boolean;
    enableCrossValidation: boolean;
    minResponseLength: number;
  };
  
  // Performance Settings
  performance: {
    maxProcessingTime: number; // milliseconds
    enableCaching: boolean;
    cacheExpiry: number; // milliseconds
    enableParallelExecution: boolean;
  };
}

// 🎯 MAX MODE DEFAULT CONFIGURATION
export const MAX_MODE_CONFIG: MaxModeConfig = {
  llm: {
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-2.5-flash",
    temperature: 0.3, // Lower temperature for precision
    maxRetries: 5,    // More retries for reliability
    maxConcurrency: 1,
  },
  
  toolSelection: {
    confidenceThreshold: 0.8,        // Higher threshold vs normal (0.6)
    maxToolsPerQuery: 5,             // Allow multiple tools
    enableMultiToolOrchestration: true,
    enableToolChaining: true,
  },
  
  processing: {
    enableQueryDecomposition: true,
    enableChainOfThought: true,
    enableMultiStepExecution: true,
    enableQualityAssurance: true,
    enableFactVerification: true,
  },
  
  responseQuality: {
    enableSourceAttribution: true,
    enableConfidenceScoring: true,
    enableUncertaintyHandling: true,
    enableCrossValidation: true,
    minResponseLength: 200, // Ensure comprehensive responses
  },
  
  performance: {
    maxProcessingTime: 60000, // 60 seconds
    enableCaching: true,
    cacheExpiry: 300000,      // 5 minutes
    enableParallelExecution: true,
  },
};

// 🎯 MAX MODE TOOL COMBINATIONS for common query types
export const MAX_MODE_TOOL_COMBINATIONS = {
  RESEARCH_ANALYSIS: {
    name: "Research Analysis",
    description: "Comprehensive research with document analysis",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    executionOrder: ["tavilySearch", "retrieveRelevantChunks"],
    confidenceThreshold: 0.85,
  },
  
  DOCUMENT_DEEP_DIVE: {
    name: "Document Deep Dive",
    description: "Thorough document analysis with cross-referencing",
    tools: ["retrieveRelevantChunks"],
    executionOrder: ["retrieveRelevantChunks"],
    confidenceThreshold: 0.9,
    enableMultiplePasses: true,
  },
  
  FACT_VERIFICATION: {
    name: "Fact Verification",
    description: "Multi-source fact checking and validation",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    executionOrder: ["tavilySearch", "retrieveRelevantChunks"],
    confidenceThreshold: 0.95,
    enableCrossValidation: true,
  },
  
  COMPREHENSIVE_ANALYSIS: {
    name: "Comprehensive Analysis",
    description: "Full analysis with all available tools",
    tools: ["tavilySearch", "retrieveRelevantChunks", "getCurrentDateTime", "getCurrentWeather"],
    executionOrder: ["tavilySearch", "retrieveRelevantChunks", "getCurrentDateTime", "getCurrentWeather"],
    confidenceThreshold: 0.8,
    enableParallelExecution: true,
  },
};

// 🎯 MAX MODE QUERY CLASSIFICATION
export const MAX_MODE_QUERY_TYPES = {
  RESEARCH: {
    name: "Research",
    description: "Information gathering and analysis",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    processingStrategy: "multi_step",
    qualityRequirements: "high",
  },
  
  ANALYSIS: {
    name: "Analysis",
    description: "Deep analysis and interpretation",
    tools: ["retrieveRelevantChunks", "tavilySearch"],
    processingStrategy: "chain_of_thought",
    qualityRequirements: "very_high",
  },
  
  COMPARISON: {
    name: "Comparison",
    description: "Comparing multiple sources or concepts",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    processingStrategy: "multi_step",
    qualityRequirements: "very_high",
  },
  
  SYNTHESIS: {
    name: "Synthesis",
    description: "Combining information from multiple sources",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    processingStrategy: "multi_step",
    qualityRequirements: "very_high",
  },
  
  VERIFICATION: {
    name: "Verification",
    description: "Fact checking and validation",
    tools: ["tavilySearch", "retrieveRelevantChunks"],
    processingStrategy: "cross_validation",
    qualityRequirements: "critical",
  },
};

// 🎯 MAX MODE EXECUTION STRATEGIES
export const MAX_MODE_EXECUTION_STRATEGIES = {
  MULTI_STEP: {
    name: "Multi-Step Execution",
    description: "Execute tools in sequence with validation",
    steps: ["research", "analysis", "synthesis", "validation"],
    enableParallelExecution: false,
    enableQualityGates: true,
  },
  
  CHAIN_OF_THOUGHT: {
    name: "Chain-of-Thought",
    description: "Step-by-step reasoning with LLM",
    steps: ["planning", "execution", "reasoning", "conclusion"],
    enableParallelExecution: false,
    enableQualityGates: true,
  },
  
  CROSS_VALIDATION: {
    name: "Cross-Validation",
    description: "Verify information across multiple sources",
    steps: ["primary_research", "secondary_research", "cross_check", "validation"],
    enableParallelExecution: true,
    enableQualityGates: true,
  },
  
  PARALLEL_EXECUTION: {
    name: "Parallel Execution",
    description: "Execute compatible tools simultaneously",
    steps: ["parallel_research", "aggregation", "analysis", "synthesis"],
    enableParallelExecution: true,
    enableQualityGates: true,
  },
};

// 🎯 MAX MODE QUALITY METRICS
export const MAX_MODE_QUALITY_METRICS = {
  ACCURACY: {
    name: "Accuracy",
    target: 0.95,
    weight: 0.4,
  },
  
  COMPLETENESS: {
    name: "Completeness",
    target: 0.9,
    weight: 0.3,
  },
  
  SOURCE_ATTRIBUTION: {
    name: "Source Attribution",
    target: 1.0,
    weight: 0.2,
  },
  
  CONFIDENCE: {
    name: "Confidence",
    target: 0.85,
    weight: 0.1,
  },
};

// 🎯 Helper functions for MAX mode configuration
export function getMaxModeConfig(): MaxModeConfig {
  return MAX_MODE_CONFIG;
}

export function getToolCombination(queryType: string) {
  return MAX_MODE_TOOL_COMBINATIONS[queryType as keyof typeof MAX_MODE_TOOL_COMBINATIONS];
}

export function getQueryType(query: string): string {
  const normalizedQuery = query.toLowerCase();
  
  if (normalizedQuery.includes("compare") || normalizedQuery.includes("difference")) {
    return "COMPARISON";
  }
  
  if (normalizedQuery.includes("verify") || normalizedQuery.includes("fact check")) {
    return "VERIFICATION";
  }
  
  if (normalizedQuery.includes("analyze") || normalizedQuery.includes("interpret")) {
    return "ANALYSIS";
  }
  
  if (normalizedQuery.includes("research") || normalizedQuery.includes("find")) {
    return "RESEARCH";
  }
  
  if (normalizedQuery.includes("synthesize") || normalizedQuery.includes("combine")) {
    return "SYNTHESIS";
  }
  
  return "RESEARCH"; // Default to research
}

export function getExecutionStrategy(queryType: string) {
  const type = MAX_MODE_QUERY_TYPES[queryType as keyof typeof MAX_MODE_QUERY_TYPES];
  return MAX_MODE_EXECUTION_STRATEGIES[type?.processingStrategy as keyof typeof MAX_MODE_EXECUTION_STRATEGIES];
}
