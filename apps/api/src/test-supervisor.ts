import { createSupervisorAgent } from "./lib/supervisor-agent";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Test the supervisor architecture
 */
async function testSupervisor() {
  console.log("🧪 Testing Supervisor Architecture...");

  const supervisor = createSupervisorAgent();

  // Test cases
  const testCases = [
    "Find information about Tribeni Mahanta",
    "Calculate the weather in London",
    "Execute a web search for AI news",
    "Plan a step-by-step approach to solve this problem",
    "Tell me about the current time",
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: "${testCase}"`);

    try {
      const result = await supervisor.invoke({
        messages: [new HumanMessage(testCase)],
      });

      console.log(
        "✅ Result:",
        result.messages[result.messages.length - 1]?.content,
      );
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
}

// Run the test
testSupervisor().catch(console.error);
