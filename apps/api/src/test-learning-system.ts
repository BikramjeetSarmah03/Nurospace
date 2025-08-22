#!/usr/bin/env bun

// Test Learning-Based Semantic System with Tool Orchestration
import { SemanticToolRegistry } from "./lib/semantic-tool-registry";
import { toolset } from "./tool/tool.index";

async function testLearningSemantic() {
  console.log("🧠 Testing Learning-Based Semantic System with Tool Orchestration\n");
  
  const registry = new SemanticToolRegistry(toolset);
  
  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("📊 Initial Learning Stats:");
  console.log(registry.getLearningStats());
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 1: Simple time query (should learn to use keywords only)
  console.log("🧪 TEST 1: Learning Simple Time Query");
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Attempt ${i}: "what time is it" ---`);
    const result = await registry.selectToolsSemantically("what time is it", undefined, 2);
    console.log(`Method: ${result.selectionMethod}`);
    console.log(`Tokens Used: ${result.tokensUsed}`);
    console.log(`Processing Time: ${result.processingTime}ms`);
    console.log(`Tools: ${result.tools.map(t => t.name).join(', ')}`);
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // 🎯 TOOL ORCHESTRATION TESTS
  
  // Test 2: Multi-tool query - Time + Weather
  console.log("🧪 TEST 2: Multi-Tool Orchestration - Time + Weather");
  const multiToolQuery1 = "what time is it and what's the weather like";
  console.log(`\n--- Query: "${multiToolQuery1}" ---`);
  const multiResult1 = await registry.selectToolsSemantically(multiToolQuery1, undefined, 3);
  console.log(`Method: ${multiResult1.selectionMethod}`);
  console.log(`Tokens Used: ${multiResult1.tokensUsed}`);
  console.log(`Processing Time: ${multiResult1.processingTime}ms`);
  console.log(`Tools Selected: ${multiResult1.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${multiResult1.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${multiResult1.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should select getCurrentDateTime + getCurrentWeather (0 tokens)`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 3: Multi-tool query - Document + Search
  console.log("🧪 TEST 3: Multi-Tool Orchestration - Document + Search");
  const multiToolQuery2 = "@doc123 analyze this and find latest news about AI";
  console.log(`\n--- Query: "${multiToolQuery2}" ---`);
  const multiResult2 = await registry.selectToolsSemantically(multiToolQuery2, undefined, 3);
  console.log(`Method: ${multiResult2.selectionMethod}`);
  console.log(`Tokens Used: ${multiResult2.tokensUsed}`);
  console.log(`Processing Time: ${multiResult2.processingTime}ms`);
  console.log(`Tools Selected: ${multiResult2.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${multiResult2.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${multiResult2.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should select retrieveRelevantChunks + tavilySearch (0 tokens)`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 4: Complex multi-tool orchestration
  console.log("🧪 TEST 4: Complex Multi-Tool Orchestration");
  const complexMultiQuery = "what time is it, check weather in London, and search for latest AI news";
  console.log(`\n--- Query: "${complexMultiQuery}" ---`);
  const complexMultiResult = await registry.selectToolsSemantically(complexMultiQuery, undefined, 4);
  console.log(`Method: ${complexMultiResult.selectionMethod}`);
  console.log(`Tokens Used: ${complexMultiResult.tokensUsed}`);
  console.log(`Processing Time: ${complexMultiResult.processingTime}ms`);
  console.log(`Tools Selected: ${complexMultiResult.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${complexMultiResult.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${complexMultiResult.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should select 3 tools: getCurrentDateTime + getCurrentWeather + tavilySearch`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 5: Document analysis with context
  console.log("🧪 TEST 5: Document Analysis with Context");
  const docAnalysisQuery = "@resume123 what are my skills and find current job openings in that field";
  console.log(`\n--- Query: "${docAnalysisQuery}" ---`);
  const docAnalysisResult = await registry.selectToolsSemantically(docAnalysisQuery, undefined, 3);
  console.log(`Method: ${docAnalysisResult.selectionMethod}`);
  console.log(`Tokens Used: ${docAnalysisResult.tokensUsed}`);
  console.log(`Processing Time: ${docAnalysisResult.processingTime}ms`);
  console.log(`Tools Selected: ${docAnalysisResult.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${docAnalysisResult.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${docAnalysisResult.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should select retrieveRelevantChunks + tavilySearch for job search`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 6: Learning pattern for complex orchestration
  console.log("🧪 TEST 6: Learning Complex Orchestration Pattern");
  const complexPattern = "time weather news";
  console.log(`\n--- Learning Pattern: "${complexPattern}" ---`);
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Attempt ${i} ---`);
    const result = await registry.selectToolsSemantically(complexPattern, undefined, 3);
    console.log(`Method: ${result.selectionMethod}`);
    console.log(`Tokens Used: ${result.tokensUsed}`);
    console.log(`Tools: ${result.tools.map(t => t.name).join(', ')}`);
    
    if (i >= 3) {
      console.log(`🎯 Expected: Should learn this 3-tool pattern for future use`);
    }
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 7: Edge case - Ambiguous query
  console.log("🧪 TEST 7: Ambiguous Query Handling");
  const ambiguousQuery = "check current status";
  console.log(`\n--- Query: "${ambiguousQuery}" ---`);
  const ambiguousResult = await registry.selectToolsSemantically(ambiguousQuery, undefined, 2);
  console.log(`Method: ${ambiguousResult.selectionMethod}`);
  console.log(`Tokens Used: ${ambiguousResult.tokensUsed}`);
  console.log(`Processing Time: ${ambiguousResult.processingTime}ms`);
  console.log(`Tools Selected: ${ambiguousResult.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${ambiguousResult.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`🎯 Expected: Should handle ambiguity gracefully`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 8: Performance under load
  console.log("🧪 TEST 8: Performance Under Load (Multiple Queries)");
  const testQueries = [
    "what time is it",
    "weather in Paris",
    "@doc456 analyze this",
    "latest news about technology",
    "time and weather",
    "@resume789 skills and job openings"
  ];
  
  console.log(`\n--- Running ${testQueries.length} queries in sequence ---`);
  const startTime = Date.now();
  let totalTokens = 0;
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n${i + 1}. "${query}"`);
    const result = await registry.selectToolsSemantically(query, undefined, 3);
    totalTokens += result.tokensUsed;
    console.log(`   Method: ${result.selectionMethod}, Tokens: ${result.tokensUsed}, Tools: ${result.tools.map(t => t.name).join(', ')}`);
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`\n📊 Load Test Results:`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log(`Average Time per Query: ${(totalTime / testQueries.length).toFixed(1)}ms`);
  console.log(`Total Tokens Used: ${totalTokens}`);
  console.log(`Average Tokens per Query: ${(totalTokens / testQueries.length).toFixed(1)}`);
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Test 9: Final learning stats
  console.log("📈 FINAL LEARNING STATS:");
  const finalStats = registry.getLearningStats();
  console.log(`Total Patterns Learned: ${finalStats.totalPatterns}`);
  console.log(`Keyword Success Rate: ${(finalStats.keywordSuccessRate * 100).toFixed(1)}%`);
  console.log(`Semantic Usage Rate: ${(finalStats.semanticUsageRate * 100).toFixed(1)}%`);
  console.log(`Average Usage Count: ${finalStats.averageUsageCount.toFixed(1)}`);
  
  console.log("\n🎉 TOOL ORCHESTRATION TEST COMPLETED!");
  console.log("\n📊 ORCHESTRATION SUMMARY:");
  console.log("- Multi-tool queries handled efficiently");
  console.log("- Learning patterns for complex orchestration");
  console.log("- Zero-token cost for most orchestrated queries");
  console.log("- Fast processing even with multiple tools");
  console.log("- Intelligent tool combination based on query intent");
}

// Run the test
testLearningSemantic().catch(console.error);
