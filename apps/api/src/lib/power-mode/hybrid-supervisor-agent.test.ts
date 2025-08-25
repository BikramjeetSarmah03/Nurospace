// 🧪 HYBRID SUPERVISOR AGENT TEST
import { createHybridSupervisorAgent } from "./hybrid-supervisor-agent";
import { HumanMessage } from "@langchain/core/messages";

// Test the hybrid supervisor agent
async function testHybridSupervisor() {
  console.log("🧪 Testing Hybrid Supervisor Agent...");

  try {
    // Create hybrid agent
    const hybridAgent = createHybridSupervisorAgent({
      enableSmartCache: true,
      cacheTTL: 300000, // 5 minutes
      enableFunctionCalling: true,
      enableFallbackRouting: true,
    });

    // Test messages
    const testMessages = [new HumanMessage("What's the weather today?")];

    console.log("🎯 Testing with message:", testMessages[0].content);

    // Process query
    const result = await hybridAgent.processQuery(testMessages, {
      configurable: { userId: "test-user-123" },
    });

    console.log("✅ Test completed successfully!");
    console.log("📊 Result:", {
      source: result.metadata.source,
      processingTime: result.metadata.processingTime,
      tokensUsed: result.metadata.tokensUsed,
      confidence: result.metadata.confidence,
      agentType:
        "agentType" in result.metadata ? result.metadata.agentType : "unknown",
    });

    console.log("📝 Response:", result.messages[0]?.content);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testHybridSupervisor();
}

export { testHybridSupervisor };
