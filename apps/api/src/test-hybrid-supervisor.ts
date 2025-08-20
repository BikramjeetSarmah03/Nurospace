import { createHybridSupervisedAgent } from "./lib/agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

async function testHybridSupervisor() {
  console.log("🚀 Testing Hybrid Supervisor Agent...\n");

  const hybridAgent = createHybridSupervisedAgent(false);
  const userId = "mC7pqADICzQTvOfUQ1e6HpxQMVhYaJmm";

  const testCases = [
    {
      name: "Time Query (Should use cache on repeat)",
      query: "What time is it now?",
      expectedAgent: "analysis"
    },
    {
      name: "Document Query",
      query: "Tell me about @cdb95b00-e214-45fa-ab49-4866f26d8bdb",
      expectedAgent: "research"
    },
    {
      name: "Weather Query",
      query: "What's the weather like?",
      expectedAgent: "execution"
    },
    {
      name: "Web Search",
      query: "Find latest news about AI",
      expectedAgent: "research"
    },
    {
      name: "Calculation",
      query: "Calculate 15 * 23",
      expectedAgent: "analysis"
    },
    {
      name: "Complex Planning",
      query: "Plan a workflow for data analysis",
      expectedAgent: "planning"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected Agent: ${testCase.expectedAgent}`);
    
    const startTime = Date.now();
    
    try {
      const messages = [
        new HumanMessage(testCase.query)
      ];

      const result = await hybridAgent(messages, {
        configurable: { userId }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Response: ${result.messages[0]?.content}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Metadata:`, result.metadata);
      
      // Test cache on repeat
      if (testCase.name.includes("Time Query")) {
        console.log("\n🔄 Testing cache on repeat...");
        const cacheStartTime = Date.now();
        
        const cacheResult = await hybridAgent(messages, {
          configurable: { userId }
        });
        
        const cacheEndTime = Date.now();
        const cacheDuration = cacheEndTime - cacheStartTime;
        
        console.log(`✅ Cached Response: ${cacheResult.messages[0]?.content}`);
        console.log(`⏱️  Cached Duration: ${cacheDuration}ms`);
        console.log(`📊 Cached Metadata:`, cacheResult.metadata);
        
        if (cacheDuration < duration) {
          console.log(`🎉 Cache working! ${duration - cacheDuration}ms faster`);
        }
      }

    } catch (error) {
      console.error(`❌ Error: ${error}`);
    }
  }

  console.log("\n🎯 Hybrid Supervisor Test Complete!");
}

// Run the test
testHybridSupervisor().catch(console.error);
