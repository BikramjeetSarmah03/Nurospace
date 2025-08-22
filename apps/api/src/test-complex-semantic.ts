#!/usr/bin/env bun

// Test Complex Queries That Need Semantic Analysis
import { SemanticToolRegistry } from "./lib/semantic-tool-registry";
import { toolset } from "./tool/tool.index";

async function testComplexSemantic() {
  console.log("🧠 Testing Complex Queries That Need Semantic Analysis\n");
  
  const registry = new SemanticToolRegistry(toolset);
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("📊 Initial Learning Stats:");
  console.log(registry.getLearningStats());
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 1: Complex analytical query (should need semantic)
  console.log("🧪 TEST 1: Complex Analytical Query");
  const complexQuery1 = "analyze the correlation between market trends and my investment portfolio performance over the last quarter";
  console.log(`\n--- Query: "${complexQuery1}" ---`);
  const result1 = await registry.selectToolsSemantically(complexQuery1, undefined, 3);
  console.log(`Method: ${result1.selectionMethod}`);
  console.log(`Tokens Used: ${result1.tokensUsed}`);
  console.log(`Processing Time: ${result1.processingTime}ms`);
  console.log(`Tools Selected: ${result1.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result1.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result1.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis (25 tokens)`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 2: Ambiguous multi-intent query
  console.log("🧪 TEST 2: Ambiguous Multi-Intent Query");
  const complexQuery2 = "compare the environmental impact of renewable energy sources versus traditional fossil fuels and provide current market analysis";
  console.log(`\n--- Query: "${complexQuery2}" ---`);
  const result2 = await registry.selectToolsSemantically(complexQuery2, undefined, 3);
  console.log(`Method: ${result2.selectionMethod}`);
  console.log(`Tokens Used: ${result2.tokensUsed}`);
  console.log(`Processing Time: ${result2.processingTime}ms`);
  console.log(`Tools Selected: ${result2.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result2.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result2.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis for complex comparison`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 3: Contextual reasoning query
  console.log("🧪 TEST 3: Contextual Reasoning Query");
  const complexQuery3 = "based on my uploaded research paper about quantum computing, what are the potential applications in cybersecurity and current industry developments";
  console.log(`\n--- Query: "${complexQuery3}" ---`);
  const result3 = await registry.selectToolsSemantically(complexQuery3, undefined, 3);
  console.log(`Method: ${result3.selectionMethod}`);
  console.log(`Tokens Used: ${result3.tokensUsed}`);
  console.log(`Processing Time: ${result3.processingTime}ms`);
  console.log(`Tools Selected: ${result3.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result3.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result3.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis for contextual reasoning`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 4: Abstract concept query
  console.log("🧪 TEST 4: Abstract Concept Query");
  const complexQuery4 = "explore the intersection of artificial intelligence ethics and regulatory frameworks in healthcare applications";
  console.log(`\n--- Query: "${complexQuery4}" ---`);
  const result4 = await registry.selectToolsSemantically(complexQuery4, undefined, 3);
  console.log(`Method: ${result4.selectionMethod}`);
  console.log(`Tokens Used: ${result4.tokensUsed}`);
  console.log(`Processing Time: ${result4.processingTime}ms`);
  console.log(`Tools Selected: ${result4.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result4.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result4.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis for abstract concepts`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 5: Force semantic by disabling keywords temporarily
  console.log("🧪 TEST 5: Force Semantic Analysis (Simulated)");
  console.log("Testing with query that has no direct keyword matches...");
  const semanticQuery = "investigate the socioeconomic implications of blockchain technology adoption in developing nations";
  console.log(`\n--- Query: "${semanticQuery}" ---`);
  const result5 = await registry.selectToolsSemantically(semanticQuery, undefined, 3);
  console.log(`Method: ${result5.selectionMethod}`);
  console.log(`Tokens Used: ${result5.tokensUsed}`);
  console.log(`Processing Time: ${result5.processingTime}ms`);
  console.log(`Tools Selected: ${result5.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result5.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result5.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis for complex investigation`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 6: Test with very long, complex query
  console.log("🧪 TEST 6: Very Long Complex Query");
  const longQuery = "analyze the comprehensive impact of climate change policies on global supply chains, considering economic factors, technological innovations, and geopolitical dynamics while examining current market trends and future projections";
  console.log(`\n--- Query: "${longQuery}" ---`);
  const result6 = await registry.selectToolsSemantically(longQuery, undefined, 4);
  console.log(`Method: ${result6.selectionMethod}`);
  console.log(`Tokens Used: ${result6.tokensUsed}`);
  console.log(`Processing Time: ${result6.processingTime}ms`);
  console.log(`Tools Selected: ${result6.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result6.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`Reasonings: ${result6.reasonings.join(' | ')}`);
  console.log(`🎯 Expected: Should use semantic analysis for comprehensive analysis`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 7: Final stats and analysis
  console.log("📈 FINAL COMPLEX QUERY STATS:");
  const finalStats = registry.getLearningStats();
  console.log(`Total Patterns Learned: ${finalStats.totalPatterns}`);
  console.log(`Keyword Success Rate: ${(finalStats.keywordSuccessRate * 100).toFixed(1)}%`);
  console.log(`Semantic Usage Rate: ${(finalStats.semanticUsageRate * 100).toFixed(1)}%`);
  console.log(`Average Usage Count: ${finalStats.averageUsageCount.toFixed(1)}`);
  
  console.log("\n🎉 COMPLEX SEMANTIC TEST COMPLETED!");
  console.log("\n📊 ANALYSIS:");
  console.log("- Complex queries should trigger semantic analysis");
  console.log("- Semantic analysis uses 25 tokens per query");
  console.log("- System should fall back to semantic when keywords insufficient");
  console.log("- Learning system adapts to complex patterns");
}

// Run the test
testComplexSemantic().catch(console.error);
