import { createSupervisorAgent } from "./lib/supervisor-agent";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Test tool invocation with supervisor architecture
 */
async function testToolInvocation() {
  console.log("🧪 Testing Tool Invocation with Supervisor Architecture...");
  
  const supervisor = createSupervisorAgent();
  
  // Test cases that should invoke specific tools
  const testCases = [
    {
      input: "Find information about Tribeni Mahanta in my documents",
      expectedAgent: "research",
      expectedTools: ["retrieveRelevantChunks"]
    },
    {
      input: "What's the weather like in London?",
      expectedAgent: "execution", 
      expectedTools: ["getCurrentWeather"]
    },
    {
      input: "What time is it right now?",
      expectedAgent: "analysis",
      expectedTools: ["getCurrentDateTime"]
    },
    {
      input: "Search the web for latest AI news",
      expectedAgent: "research",
      expectedTools: ["tavilySearch"]
    },
    {
      input: "Plan a step-by-step approach to solve this problem",
      expectedAgent: "planning",
      expectedTools: ["retrieveRelevantChunks", "tavilySearch", "getCurrentDateTime", "getCurrentWeather"]
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: "${testCase.input}"`);
    console.log(`🎯 Expected Agent: ${testCase.expectedAgent}`);
    console.log(`🛠️ Expected Tools: ${testCase.expectedTools.join(', ')}`);
    
    try {
      const result = await supervisor([new HumanMessage(testCase.input)]);
      
      console.log("✅ Result:", result.messages[result.messages.length - 1]?.content);
      
      // Check if the response indicates the correct agent was used
      const response = result.messages[result.messages.length - 1]?.content || '';
      const agentUsed = response.toLowerCase().includes(testCase.expectedAgent);
      
      if (agentUsed) {
        console.log(`✅ Correct agent (${testCase.expectedAgent}) was used`);
      } else {
        console.log(`❌ Expected agent ${testCase.expectedAgent} but got different response`);
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
}

// Run the test
testToolInvocation().catch(console.error); 