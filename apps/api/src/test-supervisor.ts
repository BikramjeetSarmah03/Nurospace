import { HumanMessage } from "@langchain/core/messages";
import { createSupervisedAgent, createAdvancedSupervisedAgent } from "./lib/agent";

/**
 * Test the supervisor agent with different types of queries
 */
async function testSupervisorAgent() {
  console.log("🧪 Testing Supervisor Agent...\n");

  // Create supervisor agent
  const supervisorAgent = createSupervisedAgent(false);

  // Test cases for different agent types
  const testCases = [
    {
      name: "Research Query",
      message: "Find information about artificial intelligence trends in 2024",
      expectedAgent: "research",
    },
    {
      name: "Analysis Query", 
      message: "What is the current date and time?",
      expectedAgent: "analysis",
    },
    {
      name: "Execution Query",
      message: "What's the weather like in New York?",
      expectedAgent: "execution",
    },
    {
      name: "Planning Query",
      message: "Create a plan for implementing a machine learning project",
      expectedAgent: "planning",
    },
    {
      name: "Personal Information Query",
      message: "Tell me about John Smith from my documents",
      expectedAgent: "research",
    },
    {
      name: "Document Mention Query",
      message: "Tell me about @cdb95b00-e214-45fa-ab49-4866f26d8bdb",
      expectedAgent: "research",
    },
    {
      name: "Document ID Query",
      message: "Tell me about [DOC_ID:cdb95b00-e214-45fa-ab49-4866f26d8bdb]",
      expectedAgent: "research",
    },
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`Query: "${testCase.message}"`);
    console.log(`Expected Agent: ${testCase.expectedAgent}`);
    
    try {
      const messages = [new HumanMessage(testCase.message)];
      
      console.log("🔄 Invoking supervisor agent...");
      const result = await supervisorAgent(messages, {
        configurable: { userId: "mC7pqADICzQTvOfUQ1e6HpxQMVhYaJmm" }
      });
      
      console.log("✅ Response received:");
      const response = result.messages[result.messages.length - 1]?.content;
      console.log(response);
      console.log("---\n");
      
    } catch (error) {
      console.error(`❌ Error in ${testCase.name}:`, error);
      console.log("---\n");
    }
  }
}

/**
 * Test the advanced supervisor agent
 */
async function testAdvancedSupervisorAgent() {
  console.log("🚀 Testing Advanced Supervisor Agent...\n");

  const advancedAgent = createAdvancedSupervisedAgent(false);

  const testMessage = "What's the weather like in London and what's the current date?";
  console.log(`📝 Testing: Complex Query`);
  console.log(`Query: "${testMessage}"`);
  
  try {
    const messages = [new HumanMessage(testMessage)];
    
    console.log("🔄 Invoking advanced supervisor agent...");
    const result = await advancedAgent(messages, {
      configurable: { userId: "mC7pqADICzQTvOfUQ1e6HpxQMVhYaJmm" }
    });
    
    console.log("✅ Response received:");
    const response = result.messages[result.messages.length - 1]?.content;
    console.log(response);
    
  } catch (error) {
    console.error("❌ Error in advanced supervisor:", error);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log("🎯 Starting Supervisor Agent Tests\n");
  
  try {
    await testSupervisorAgent();
    await testAdvancedSupervisorAgent();
    
    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runTests();
}

export { testSupervisorAgent, testAdvancedSupervisorAgent, runTests };
