// 🚀 MAX MODE DEBUG TEST SCRIPT
// Use this to test and debug MAX mode functionality

import { maxModeSupervisor } from "./max-mode-supervisor";
import { maxQueryDecomposer } from "./max-query-decomposer";

// Test queries of different complexity levels
const testQueries = [
  // Simple queries (should use normal mode)
  "Hello",
  "What's the weather like?",
  "Hi there",

  // Medium complexity (may auto-detect MAX mode)
  "What are the benefits of exercise?",
  "Tell me about renewable energy",
  "How does machine learning work?",

  // High complexity (definitely MAX mode)
  "Analyze the impact of artificial intelligence on job markets, identify emerging trends, and suggest strategies for workforce adaptation",
  "Research and compare the latest developments in quantum computing and their potential impact on cybersecurity",
  "Examine the pros and cons of remote work policies and their effects on productivity, employee satisfaction, and company culture",
];

// Test individual components
export async function testMaxModeComponents() {
  console.log("🚀 Testing MAX Mode Components...\n");

  for (const query of testQueries) {
    console.log(`\n--- Testing Query: "${query}" ---`);

    try {
      // Test query decomposition
      console.log("🔍 Testing Query Decomposition...");
      const decomposition = await maxQueryDecomposer.decomposeQuery(query);
      console.log("✅ Decomposition Result:", {
        intent: decomposition.intent,
        complexity: decomposition.estimatedComplexity,
        subQuestions: decomposition.subQuestions.length,
        processingTime: decomposition.totalProcessingTime,
      });

      // Test full MAX mode processing
      console.log("🚀 Testing Full MAX Mode Processing...");
      const startTime = Date.now();
      const result = await maxModeSupervisor.processQuery(query);
      const totalTime = Date.now() - startTime;

      console.log("✅ MAX Mode Result:", {
        mode: result.mode,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        processingTime: `${result.processingTime}ms`,
        totalTime: `${totalTime}ms`,
        steps: result.executionResult.steps.length,
        quality: result.qualityMetrics,
      });
    } catch (error) {
      console.error(
        "❌ Test failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}

// Test specific query with detailed logging
export async function testSpecificQuery(query: string) {
  console.log(`\n🚀 Testing Specific Query: "${query}"`);
  console.log("=".repeat(60));

  try {
    const startTime = Date.now();

    // Step 1: Query Decomposition
    console.log("\n🔍 Step 1: Query Decomposition");
    const decomposition = await maxQueryDecomposer.decomposeQuery(query);
    console.log("✅ Decomposition completed:", {
      intent: decomposition.intent,
      complexity: decomposition.estimatedComplexity,
      subQuestions: decomposition.subQuestions.length,
      processingTime: decomposition.totalProcessingTime,
    });

    // Step 2: Full MAX Mode Processing
    console.log("\n🚀 Step 2: Full MAX Mode Processing");
    const result = await maxModeSupervisor.processQuery(query);
    const totalTime = Date.now() - startTime;

    console.log("✅ MAX Mode completed:", {
      mode: result.mode,
      confidence: `${(result.confidence * 100).toFixed(1)}%`,
      processingTime: `${result.processingTime}ms`,
      totalTime: `${totalTime}ms`,
      steps: result.executionResult.steps.length,
      quality: result.qualityMetrics,
    });

    // Step 3: Show detailed results
    console.log("\n📊 Detailed Results:");
    console.log(
      "Enhanced Response:",
      result.enhancedResponse.substring(0, 200) + "...",
    );
    console.log("Quality Metrics:", result.qualityMetrics);
    console.log("Recommendations:", result.recommendations);
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

// Test mode detection logic
export function testModeDetection() {
  console.log("\n🔍 Testing Mode Detection Logic...");

  for (const query of testQueries) {
    const shouldUseMax = maxModeSupervisor["shouldUseMaxMode"](query);
    console.log(`"${query}" -> MAX Mode: ${shouldUseMax ? "Yes" : "No"}`);
  }
}

// Main test function
export async function runAllTests() {
  console.log("🚀 MAX MODE COMPREHENSIVE TEST SUITE");
  console.log("=".repeat(60));

  // Test 1: Mode Detection
  testModeDetection();

  // Test 2: Component Testing
  await testMaxModeComponents();

  // Test 3: Specific Complex Query
  const complexQuery =
    "Analyze the impact of artificial intelligence on job markets, identify emerging trends, and suggest strategies for workforce adaptation";
  await testSpecificQuery(complexQuery);

  console.log("\n🎉 All tests completed!");
}

// Export for use in other files
export const debugTests = {
  testMaxModeComponents,
  testSpecificQuery,
  testModeDetection,
  runAllTests,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
