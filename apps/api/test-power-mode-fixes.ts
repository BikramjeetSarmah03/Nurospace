// 🧪 TEST POWER MODE FIXES
import { createHybridSupervisorAgent } from "./src/lib/hybrid-supervisor-agent";
import { HumanMessage } from "@langchain/core/messages";

async function testPowerModeFixes() {
  console.log("🧪 Testing POWER Mode Fixes...\n");

  try {
    // Create hybrid supervisor agent
    const hybridAgent = createHybridSupervisorAgent({
      enableSmartCache: false, // Disable cache for testing
      enableFunctionCalling: true,
      enableFallbackRouting: true,
    });

    // Test 1: Simple time query (should use execution agent)
    console.log("🔍 Test 1: Simple time query");
    const timeQuery = [new HumanMessage("whats the time")];
    const timeResult = await hybridAgent.processQuery(timeQuery);
    console.log("✅ Time query result:", {
      source: timeResult.metadata.source,
      agentType: timeResult.metadata.agentType,
      toolsUsed: timeResult.metadata.toolsUsed,
      confidence: timeResult.metadata.confidence,
    });
    console.log(
      "📝 Response preview:",
      timeResult.messages[0].content.substring(0, 100) + "...\n",
    );

    // Test 2: Complex research query (should use research agent)
    console.log("🔍 Test 2: Complex research query");
    const researchQuery = [
      new HumanMessage(
        "Research the latest AI developments and analyze their impact",
      ),
    ];
    const researchResult = await hybridAgent.processQuery(researchQuery);
    console.log("✅ Research query result:", {
      source: researchResult.metadata.source,
      agentType: researchResult.metadata.agentType,
      toolsUsed: researchResult.metadata.toolsUsed,
      confidence: researchResult.metadata.confidence,
    });
    console.log(
      "📝 Response preview:",
      researchResult.messages[0].content.substring(0, 100) + "...\n",
    );

    // Test 3: Multi-tool query (should use multiple tools)
    console.log("🔍 Test 3: Multi-tool query");
    const multiQuery = [
      new HumanMessage(
        "What's the weather and time? Also search for local events",
      ),
    ];
    const multiResult = await hybridAgent.processQuery(multiQuery);
    console.log("✅ Multi-tool query result:", {
      source: multiResult.metadata.source,
      agentType: multiResult.metadata.agentType,
      toolsUsed: multiResult.metadata.toolsUsed,
      confidence: multiResult.metadata.confidence,
    });
    console.log(
      "📝 Response preview:",
      multiResult.messages[0].content.substring(0, 100) + "...\n",
    );

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPowerModeFixes();
}

export { testPowerModeFixes };
