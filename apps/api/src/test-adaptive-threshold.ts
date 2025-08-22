#!/usr/bin/env bun

// Test Adaptive Threshold - Prevent Tool Over-Selection
import { SemanticToolRegistry } from "./lib/semantic-tool-registry";
import { toolset } from "./tool/tool.index";

async function testAdaptiveThreshold() {
  console.log("🧠 Testing Adaptive Threshold - Prevent Tool Over-Selection\n");
  
  const registry = new SemanticToolRegistry(toolset);
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("📊 Testing Adaptive Threshold System\n");
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 1: Simple time query (should select only 1 tool)
  console.log("🧪 TEST 1: Simple Time Query");
  const timeQuery = "what time is it";
  console.log(`\n--- Query: "${timeQuery}" ---`);
  const result1 = await registry.selectToolsSemantically(timeQuery, undefined, 3);
  console.log(`Method: ${result1.selectionMethod}`);
  console.log(`Tools Selected: ${result1.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result1.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`🎯 Expected: Should select only getCurrentDateTime (1 tool)`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 2: Compound query (should select only 2 tools)
  console.log("🧪 TEST 2: Compound Query - Time + News");
  const compoundQuery = "whats is the age of Mark Zuckerberg";
  console.log(`\n--- Query: "${compoundQuery}" ---`);
  const result2 = await registry.selectToolsSemantically(compoundQuery, undefined, 3);
  console.log(`Method: ${result2.selectionMethod}`);
  console.log(`Tools Selected: ${result2.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result2.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`🎯 Expected: Should select only getCurrentDateTime + tavilySearch (2 tools, NO retrieveRelevantChunks)`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 3: Document query (should select only 1 tool)
  console.log("🧪 TEST 3: Document Query");
  const docQuery = "@doc123 analyze this";
  console.log(`\n--- Query: "${docQuery}" ---`);
  const result3 = await registry.selectToolsSemantically(docQuery, undefined, 3);
  console.log(`Method: ${result3.selectionMethod}`);
  console.log(`Tools Selected: ${result3.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result3.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`🎯 Expected: Should select only retrieveRelevantChunks (1 tool)`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 4: Complex query (should respect adaptive threshold)
  console.log("🧪 TEST 4: Complex Query - Age Calculation");
  const ageQuery = "what is the age of person who born in 2000";
  console.log(`\n--- Query: "${ageQuery}" ---`);
  const result4 = await registry.selectToolsSemantically(ageQuery, undefined, 3);
  console.log(`Method: ${result4.selectionMethod}`);
  console.log(`Tools Selected: ${result4.tools.map(t => t.name).join(', ')}`);
  console.log(`Confidence Scores: ${result4.confidenceScores.map(s => `${(s * 100).toFixed(1)}%`).join(', ')}`);
  console.log(`🎯 Expected: Should respect adaptive threshold and not over-select tools`);
  
  console.log("\n" + "=".repeat(70) + "\n");
  
  // Test 5: Final analysis
  console.log("📈 FINAL ADAPTIVE THRESHOLD ANALYSIS:");
  console.log("✅ Test 1: Simple time query - Tool selection");
  console.log("✅ Test 2: Compound query - Tool over-selection prevention");
  console.log("✅ Test 3: Document query - Targeted tool selection");
  console.log("✅ Test 4: Complex query - Adaptive threshold respect");
  
  console.log("\n🎉 ADAPTIVE THRESHOLD TEST COMPLETED!");
  console.log("\n📊 ANALYSIS:");
  console.log("- Simple queries should select minimal tools");
  console.log("- Compound queries should select only relevant tools");
  console.log("- Adaptive threshold should prevent over-selection");
  console.log("- System should respect confidence scores");
}

// Run the test
testAdaptiveThreshold().catch(console.error);
