// 🚀 MAX MODE INTEGRATION EXAMPLE - How to use MAX mode in Nurospace
// This file shows how to integrate MAX mode with the existing semantic supervisor

import { maxModeSupervisor } from "./max-mode-supervisor";
import { createSemanticSupervisor } from "../semantic-supervisor";
import { HumanMessage } from "@langchain/core/messages";

// Example 1: Direct MAX Mode Usage
export async function processQueryWithMaxMode(query: string, userId?: string) {
  try {
    console.log("[EXAMPLE] 🚀 Processing query with MAX mode:", query);

    const result = await maxModeSupervisor.processQuery(query, userId);

    console.log("[EXAMPLE] ✅ MAX mode result:", {
      mode: result.mode,
      confidence: `${(result.confidence * 100).toFixed(1)}%`,
      processingTime: `${result.processingTime}ms`,
      steps: result.executionResult.steps.length,
      quality: result.qualityMetrics,
    });

    return result;
  } catch (error) {
    console.error("[EXAMPLE] ❌ MAX mode processing failed:", error);
    throw error;
  }
}

// Example 2: Integration with Existing Semantic Supervisor
export async function enhancedSemanticProcessing(
  query: string,
  userId?: string,
) {
  try {
    console.log("[EXAMPLE] 🔄 Enhanced semantic processing for:", query);

    // First, try MAX mode for complex queries
    const maxModeResult =
      await maxModeSupervisor.integrateWithSemanticSupervisor(query, userId);

    if (maxModeResult) {
      console.log("[EXAMPLE] ✅ MAX mode activated for complex query");
      return {
        mode: "max",
        response: maxModeResult.enhancedResponse,
        confidence: maxModeResult.confidence,
        quality: maxModeResult.qualityMetrics,
        recommendations: maxModeResult.recommendations,
      };
    }

    // Fallback to normal semantic processing
    console.log("[EXAMPLE] 🔄 Using normal semantic processing");
    const semanticSupervisor = createSemanticSupervisor(false);
    const normalResult = await semanticSupervisor([new HumanMessage(query)], {
      configurable: { userId },
    });

    return {
      mode: "normal",
      response: normalResult.messages[0]?.content || "No response generated",
      confidence: 0.7, // Default confidence for normal mode
      quality: {
        accuracy: 0.7,
        completeness: 0.7,
        sourceAttribution: 0.5,
        confidence: 0.7,
      },
      recommendations: [],
    };
  } catch (error) {
    console.error("[EXAMPLE] ❌ Enhanced processing failed:", error);
    throw error;
  }
}

// Example 3: Conditional MAX Mode Activation
export async function smartModeSelection(query: string, userId?: string) {
  try {
    // Check if query should use MAX mode
    const shouldUseMaxMode = maxModeSupervisor["shouldUseMaxMode"](query);

    if (shouldUseMaxMode) {
      console.log("[EXAMPLE] 🚀 Query qualifies for MAX mode");
      return await maxModeSupervisor.processQuery(query, userId);
    }
    console.log("[EXAMPLE] 🔄 Query using normal mode");
    const semanticSupervisor = createSemanticSupervisor(false);
    const result = await semanticSupervisor([new HumanMessage(query)], {
      configurable: { userId },
    });
    return result;
  } catch (error) {
    console.error("[EXAMPLE] ❌ Smart mode selection failed:", error);
    throw error;
  }
}

// Example 4: MAX Mode with Custom Configuration
export async function customMaxModeProcessing(
  query: string,
  userId?: string,
  customConfig?: any,
) {
  try {
    console.log("[EXAMPLE] 🎯 Custom MAX mode processing:", query);

    // You can modify the configuration here if needed
    if (customConfig) {
      console.log("[EXAMPLE] ⚙️ Using custom configuration:", customConfig);
    }

    const result = await maxModeSupervisor.processQuery(query, userId);

    // Add custom post-processing if needed
    if (customConfig?.addCustomAnalysis) {
      result.enhancedResponse +=
        "\n\n--- Custom Analysis ---\nThis response was enhanced with custom processing.";
    }

    return result;
  } catch (error) {
    console.error("[EXAMPLE] ❌ Custom MAX mode failed:", error);
    throw error;
  }
}

// Example 5: Batch Processing with MAX Mode
export async function batchMaxModeProcessing(
  queries: string[],
  userId?: string,
) {
  try {
    console.log(
      "[EXAMPLE] 📦 Batch processing with MAX mode:",
      queries.length,
      "queries",
    );

    const results = [];

    for (const query of queries) {
      try {
        const result = await maxModeSupervisor.processQuery(query, userId);
        results.push({
          query,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          query,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `[EXAMPLE] ✅ Batch processing completed: ${successCount}/${queries.length} successful`,
    );

    return results;
  } catch (error) {
    console.error("[EXAMPLE] ❌ Batch processing failed:", error);
    throw error;
  }
}

// Example 6: MAX Mode Performance Monitoring
export async function monitoredMaxModeProcessing(
  query: string,
  userId?: string,
) {
  const startTime = Date.now();
  const memoryUsage = process.memoryUsage();

  try {
    console.log("[EXAMPLE] 📊 Starting monitored MAX mode processing");

    const result = await maxModeSupervisor.processQuery(query, userId);

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    const finalMemoryUsage = process.memoryUsage();

    const performanceMetrics = {
      processingTime,
      memoryDelta: {
        heapUsed: finalMemoryUsage.heapUsed - memoryUsage.heapUsed,
        heapTotal: finalMemoryUsage.heapTotal - memoryUsage.heapTotal,
        external: finalMemoryUsage.external - memoryUsage.external,
      },
      queryComplexity: result.decomposition.estimatedComplexity,
      stepsExecuted: result.executionResult.steps.length,
      overallConfidence: result.confidence,
    };

    console.log("[EXAMPLE] 📊 Performance metrics:", performanceMetrics);

    return {
      ...result,
      performanceMetrics,
    };
  } catch (error) {
    const endTime = Date.now();
    console.error(
      `[EXAMPLE] ❌ Monitored processing failed after ${endTime - startTime}ms:`,
      error,
    );
    throw error;
  }
}

// Example 7: Integration with Chat Service
export async function maxModeChatIntegration(
  query: string,
  userId?: string,
  chatContext?: any,
) {
  try {
    console.log("[EXAMPLE] 💬 MAX mode chat integration:", query);

    // Check if this is a complex query that needs MAX mode
    const isComplexQuery =
      query.length > 50 ||
      query.toLowerCase().includes("analyze") ||
      query.toLowerCase().includes("compare") ||
      query.toLowerCase().includes("research");

    if (isComplexQuery) {
      console.log("[EXAMPLE] 🚀 Complex query detected, using MAX mode");

      const maxResult = await maxModeSupervisor.processQuery(query, userId);

      // Format for chat display
      return {
        type: "max_mode_response",
        content: maxResult.enhancedResponse,
        confidence: maxResult.confidence,
        quality: maxResult.qualityMetrics,
        recommendations: maxResult.recommendations,
        processingTime: maxResult.processingTime,
        sources: maxResult.executionResult.sources,
        metadata: {
          mode: "max",
          complexity: maxResult.decomposition.estimatedComplexity,
          steps: maxResult.executionResult.steps.length,
        },
      };
    }
    console.log("[EXAMPLE] 🔄 Simple query, using normal processing");

    // Use normal semantic processing
    const semanticSupervisor = createSemanticSupervisor(false);
    const normalResult = await semanticSupervisor([new HumanMessage(query)], {
      configurable: { userId },
    });

    return {
      type: "normal_response",
      content: normalResult.messages[0]?.content || "No response generated",
      confidence: 0.7,
      quality: {
        accuracy: 0.7,
        completeness: 0.7,
        sourceAttribution: 0.5,
        confidence: 0.7,
      },
      recommendations: [],
      processingTime: 5000, // Estimated
      sources: [],
      metadata: {
        mode: "normal",
        complexity: "low",
        steps: 1,
      },
    };
  } catch (error) {
    console.error("[EXAMPLE] ❌ Chat integration failed:", error);
    throw error;
  }
}

// Export all examples
export const maxModeExamples = {
  processQueryWithMaxMode,
  enhancedSemanticProcessing,
  smartModeSelection,
  customMaxModeProcessing,
  batchMaxModeProcessing,
  monitoredMaxModeProcessing,
  maxModeChatIntegration,
};
