// 🚀 MAX MODE SUPERVISOR - Enhanced AI System Integration
import { getLLM } from "../llm";
import { MAX_MODE_CONFIG } from "./max-mode-config";
import {
  maxQueryDecomposer,
  type QueryDecomposition,
} from "./max-query-decomposer";
import {
  maxExecutionOrchestrator,
  type ExecutionResult,
} from "./max-execution-orchestrator";
import { toolset } from "../../tool/tool.index";
import { TOOL_CONFIGS } from "../tool-config";

export interface MaxModeResponse {
  mode: "max";
  originalQuery: string;
  decomposition: QueryDecomposition;
  executionResult: ExecutionResult;
  enhancedResponse: string;
  confidence: number;
  processingTime: number;
  qualityMetrics: {
    accuracy: number;
    completeness: number;
    sourceAttribution: number;
    confidence: number;
  };
  recommendations: string[];
}

export class MaxModeSupervisor {
  private llm = getLLM(MAX_MODE_CONFIG.llm.primaryModel as any);

  async processQuery(query: string, userId?: string): Promise<MaxModeResponse> {
    console.log("[MAX MODE] 🚀 Processing query with MAX mode:", query);

    const startTime = Date.now();

    try {
      // Step 1: Query Decomposition
      console.log("[MAX MODE] 🔍 Step 1: Decomposing query...");
      const decomposition = await maxQueryDecomposer.decomposeQuery(
        query,
        userId,
      );

      // Step 2: Enhanced Tool Selection
      console.log("[MAX MODE] 🛠️ Step 2: Enhanced tool selection...");
      const enhancedTools = await this.selectEnhancedTools(
        query,
        decomposition,
      );

      // Step 3: Multi-Step Execution
      console.log("[MAX MODE] ⚡ Step 3: Multi-step execution...");
      const executionResult = await maxExecutionOrchestrator.executeQuery(
        query,
        decomposition,
        userId,
      );

      // Step 4: Response Enhancement
      console.log("[MAX MODE] 🎯 Step 4: Enhancing response...");
      const enhancedResponse = await this.enhanceResponse(
        query,
        executionResult,
      );

      // Step 5: Quality Assessment
      console.log("[MAX MODE] 📊 Step 5: Quality assessment...");
      const qualityMetrics = this.assessQuality(executionResult);

      // Step 6: Generate Recommendations
      console.log("[MAX MODE] 💡 Step 6: Generating recommendations...");
      const recommendations = await this.generateRecommendations(
        query,
        qualityMetrics,
        decomposition,
      );

      const response: MaxModeResponse = {
        mode: "max",
        originalQuery: query,
        decomposition,
        executionResult,
        enhancedResponse,
        confidence: executionResult.overallConfidence,
        processingTime: Date.now() - startTime,
        qualityMetrics,
        recommendations,
      };

      console.log("[MAX MODE] ✅ MAX mode processing completed:", {
        processingTime: `${response.processingTime}ms`,
        confidence: `${(response.confidence * 100).toFixed(1)}%`,
        qualityScore: `${(qualityMetrics.accuracy * 100).toFixed(1)}%`,
      });

      return response;
    } catch (error) {
      console.error("[MAX MODE] ❌ MAX mode processing failed:", error);
      throw error;
    }
  }

  private async selectEnhancedTools(
    query: string,
    decomposition: QueryDecomposition,
  ): Promise<string[]> {
    // Enhanced tool selection for MAX mode
    const queryType = decomposition.intent;
    const availableTools = toolset;

    // Get tool combinations based on query type
    const toolCombination = this.getToolCombinationForQueryType(queryType);

    if (toolCombination) {
      return toolCombination.tools;
    }

    // Fallback to intelligent tool selection
    const selectedTools: string[] = [];

    // Always include research tools for comprehensive analysis
    if (availableTools.some((t) => t.name === "tavilySearch")) {
      selectedTools.push("tavilySearch");
    }

    // Include document analysis if available
    if (availableTools.some((t) => t.name === "retrieveRelevantChunks")) {
      selectedTools.push("retrieveRelevantChunks");
    }

    // Add context-specific tools
    if (
      query.toLowerCase().includes("time") ||
      query.toLowerCase().includes("date")
    ) {
      if (availableTools.some((t) => t.name === "getCurrentDateTime")) {
        selectedTools.push("getCurrentDateTime");
      }
    }

    if (query.toLowerCase().includes("weather")) {
      if (availableTools.some((t) => t.name === "getCurrentWeather")) {
        selectedTools.push("getCurrentWeather");
      }
    }

    return selectedTools.slice(
      0,
      MAX_MODE_CONFIG.toolSelection.maxToolsPerQuery,
    );
  }

  private getToolCombinationForQueryType(queryType: string): any {
    const combinations = {
      RESEARCH: {
        tools: ["tavilySearch", "retrieveRelevantChunks"],
        confidenceThreshold: 0.85,
      },
      ANALYSIS: {
        tools: ["retrieveRelevantChunks", "tavilySearch"],
        confidenceThreshold: 0.9,
      },
      COMPARISON: {
        tools: ["tavilySearch", "retrieveRelevantChunks"],
        confidenceThreshold: 0.9,
      },
      VERIFICATION: {
        tools: ["tavilySearch", "retrieveRelevantChunks"],
        confidenceThreshold: 0.95,
      },
      SYNTHESIS: {
        tools: ["tavilySearch", "retrieveRelevantChunks"],
        confidenceThreshold: 0.85,
      },
    };

    return combinations[queryType as keyof typeof combinations];
  }

  private async enhanceResponse(
    query: string,
    executionResult: ExecutionResult,
  ): Promise<string> {
    console.log("[MAX MODE] 🎯 Starting response enhancement...");

    const prompt = `Enhance this response to be more comprehensive and professional:

Original Query: "${query}"

Current Response: "${executionResult.finalResponse}"

Please enhance the response to:
1. Be more comprehensive and detailed
2. Include clear structure with headings
3. Provide actionable insights
4. Acknowledge any limitations
5. Suggest follow-up questions
6. Use professional language and formatting

Enhanced Response:`;

    try {
      // Add timeout to LLM call
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("LLM enhancement timeout")), 15000); // 15 second timeout
      });

      const llmPromise = this.llm.invoke(prompt);

      const response = await Promise.race([llmPromise, timeoutPromise]);
      const enhancedResponse =
        response.content?.toString() || executionResult.finalResponse;

      if (
        enhancedResponse &&
        enhancedResponse.length > executionResult.finalResponse.length
      ) {
        console.log(
          "[MAX MODE] ✅ Response enhancement successful, length increased from",
          executionResult.finalResponse.length,
          "to",
          enhancedResponse.length,
        );
        return enhancedResponse;
      }
      console.log(
        "[MAX MODE] ⚠️ Response enhancement returned insufficient content, using fallback formatting",
      );
      return this.formatResponseFallback(query, executionResult);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn("[MAX MODE] ⚠️ Response enhancement failed:", errorMessage);
      console.log("[MAX MODE] 🔄 Using fallback response formatting");
      return this.formatResponseFallback(query, executionResult);
    }
  }

  // Fallback response formatting when LLM enhancement fails
  private formatResponseFallback(
    query: string,
    executionResult: ExecutionResult,
  ): string {
    console.log("[MAX MODE] 🔄 Applying fallback response formatting...");

    const originalResponse = executionResult.finalResponse;
    const completedSteps = executionResult.steps.filter(
      (s) => s.status === "completed",
    );

    // Create a structured response with the original content
    let formattedResponse = "🚀 **MAX MODE ANALYSIS RESULTS**\n\n";
    formattedResponse += `**Original Query:** ${query}\n\n`;

    // Format the original response with better structure
    if (originalResponse.includes("Search Results:")) {
      // Format search results with better structure
      formattedResponse += "**Analysis Results:**\n\n";

      // Split the response into sections and format each one
      const sections = originalResponse.split(/(?=Search Results:)/);

      sections.forEach((section, index) => {
        if (section.trim()) {
          // Clean up the section
          let cleanSection = section
            .replace(/Search Results:/g, "🔍 **Research Findings:**")
            .replace(/\n\n+/g, "\n\n")
            .trim();

          // Add section number if multiple sections
          if (sections.length > 1) {
            cleanSection = `**Section ${index + 1}:**\n${cleanSection}`;
          }

          formattedResponse += `${cleanSection}\n\n`;

          // Add separator between sections
          if (index < sections.length - 1) {
            formattedResponse += "---\n\n";
          }
        }
      });
    } else {
      // For non-search results, format with better structure
      formattedResponse += "**Analysis Results:**\n\n";

      // Clean up the response
      const cleanResponse = originalResponse
        .replace(/\n\n+/g, "\n\n")
        .replace(/\s+/g, " ")
        .trim();

      // Split into paragraphs and format
      const paragraphs = cleanResponse.split("\n\n");
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          formattedResponse += `${paragraph.trim()}\n\n`;
        }
      });
    }

    // Add structured analysis summary
    formattedResponse += "---\n\n";
    formattedResponse += "📊 **Analysis Summary:**\n";
    formattedResponse += `• **Steps Completed:** ${completedSteps.length}/${executionResult.steps.length}\n`;
    formattedResponse += `• **Overall Confidence:** ${(executionResult.overallConfidence * 100).toFixed(1)}%\n`;
    formattedResponse += `• **Processing Time:** ${executionResult.totalExecutionTime}ms\n\n`;

    // Add step-by-step breakdown if available
    if (completedSteps.length > 0) {
      formattedResponse += "🔍 **Analysis Steps:**\n";
      completedSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepStatus = step.status === "completed" ? "✅" : "❌";
        formattedResponse += `${stepNumber}. ${stepStatus} ${step.question}\n`;
      });
      formattedResponse += "\n";
    }

    // Add intelligent recommendations
    formattedResponse += "💡 **Recommendations:**\n";

    if (completedSteps.length < executionResult.steps.length) {
      formattedResponse +=
        "• Some analysis steps failed - consider rephrasing your question\n";
    }

    if (executionResult.overallConfidence < 0.7) {
      formattedResponse +=
        "• Confidence is low - try being more specific in your query\n";
    }

    if (executionResult.totalExecutionTime > 30000) {
      formattedResponse +=
        "• Processing took longer than expected - consider breaking down complex questions\n";
    }

    // Add general recommendations
    formattedResponse += "• Ask follow-up questions for specific details\n";
    formattedResponse += "• Upload relevant documents for deeper analysis\n";
    formattedResponse += "• Request recent information for current trends\n\n";

    formattedResponse += "🚀 *Powered by MAX MODE - Enhanced AI Analysis*";

    return formattedResponse;
  }

  private assessQuality(executionResult: ExecutionResult): {
    accuracy: number;
    completeness: number;
    sourceAttribution: number;
    confidence: number;
  } {
    const completedSteps = executionResult.steps.filter(
      (s) => s.status === "completed",
    );
    const totalSteps = executionResult.steps.length;

    if (totalSteps === 0) {
      return {
        accuracy: 0,
        completeness: 0,
        sourceAttribution: 0,
        confidence: 0,
      };
    }

    const accuracy =
      completedSteps.reduce((sum, step) => {
        if (step.result && Array.isArray(step.result)) {
          const stepAccuracy =
            step.result.reduce((acc, r) => acc + (r.confidence || 0), 0) /
            step.result.length;
          return sum + stepAccuracy;
        }
        return sum + 0.5; // Default accuracy for steps without results
      }, 0) / totalSteps;

    const completeness = completedSteps.length / totalSteps;
    const sourceAttribution = executionResult.sources.length > 0 ? 1 : 0;
    const confidence = executionResult.overallConfidence;

    return { accuracy, completeness, sourceAttribution, confidence };
  }

  private async generateRecommendations(
    query: string,
    qualityMetrics: any,
    decomposition: QueryDecomposition,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Quality-based recommendations
    if (qualityMetrics.accuracy < 0.8) {
      recommendations.push(
        "Consider rephrasing your question for more accurate results",
      );
    }

    if (qualityMetrics.completeness < 0.8) {
      recommendations.push(
        "Some analysis steps failed - try breaking down your question",
      );
    }

    if (qualityMetrics.sourceAttribution < 1) {
      recommendations.push("Consider asking for specific sources or citations");
    }

    // Complexity-based recommendations
    if (decomposition.estimatedComplexity === "critical") {
      recommendations.push(
        "This is a complex query - consider using multiple focused questions instead",
      );
    }

    if (decomposition.subQuestions.length > 3) {
      recommendations.push(
        "Consider focusing on the most important aspects of your question",
      );
    }

    // Tool-specific recommendations
    if (
      decomposition.subQuestions.some((q) =>
        q.expectedTools.includes("retrieveRelevantChunks"),
      )
    ) {
      recommendations.push(
        "Upload relevant documents for more accurate analysis",
      );
    }

    if (
      decomposition.subQuestions.some((q) =>
        q.expectedTools.includes("tavilySearch"),
      )
    ) {
      recommendations.push(
        "Consider asking for the most recent information available",
      );
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  // Integration method for existing semantic supervisor
  async integrateWithSemanticSupervisor(
    query: string,
    userId?: string,
  ): Promise<any> {
    try {
      // Use MAX mode for complex queries
      if (this.shouldUseMaxMode(query)) {
        return await this.processQuery(query, userId);
      }

      // Fallback to normal semantic processing
      console.log("[MAX MODE] Query not complex enough, using normal mode");
      return null;
    } catch (error) {
      console.error("[MAX MODE] Integration failed:", error);
      return null;
    }
  }

  private shouldUseMaxMode(query: string): boolean {
    const normalizedQuery = query.toLowerCase();

    // Use MAX mode for complex queries
    const complexIndicators = [
      "compare",
      "analyze",
      "research",
      "investigate",
      "examine",
      "evaluate",
      "assess",
      "synthesize",
      "verify",
      "fact check",
      "comprehensive",
      "detailed",
      "thorough",
      "in-depth",
    ];

    const hasComplexIndicator = complexIndicators.some((indicator) =>
      normalizedQuery.includes(indicator),
    );

    // Use MAX mode for long queries (more than 50 characters)
    const isLongQuery = query.length > 50;

    // Use MAX mode for queries with multiple parts
    const hasMultipleParts =
      normalizedQuery.includes(" and ") ||
      normalizedQuery.includes(" or ") ||
      normalizedQuery.includes(" but ") ||
      normalizedQuery.includes(";") ||
      normalizedQuery.includes(",");

    return hasComplexIndicator || isLongQuery || hasMultipleParts;
  }
}

export const maxModeSupervisor = new MaxModeSupervisor();
