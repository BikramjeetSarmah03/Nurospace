import { retrieveRelevantChunks } from "./tool/research/retrieveRelevantChunks";

async function testDocumentSearch() {
  console.log("🧪 Testing Improved Document Search...\n");

  const userId = "mC7pqADICzQTvOfUQ1e6HpxQMVhYaJmm";
  const docId = "cdb95b00-e214-45fa-ab49-4866f26d8bdb";

  // Test 1: Document mention with name query
  console.log("📋 Test 1: Document mention with name query");
  console.log("Query: @cdb95b00-e214-45fa-ab49-4866f26d8bdb what the name mention here");
  
  try {
    const result1 = await retrieveRelevantChunks(
      `@${docId} what the name mention here`,
      userId,
      5
    );
    
    console.log("✅ Result:", result1);
    console.log("📄 First chunk preview:", result1[0]?.substring(0, 200) + "...");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 2: Document mention with different name query
  console.log("📋 Test 2: Document mention with different name query");
  console.log("Query: @cdb95b00-e214-45fa-ab49-4866f26d8bdb who is this person");
  
  try {
    const result2 = await retrieveRelevantChunks(
      `@${docId} who is this person`,
      userId,
      5
    );
    
    console.log("✅ Result:", result2);
    console.log("📄 First chunk preview:", result2[0]?.substring(0, 200) + "...");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 3: Document mention with extract query
  console.log("📋 Test 3: Document mention with extract query");
  console.log("Query: @cdb95b00-e214-45fa-ab49-4866f26d8bdb extract personal information");
  
  try {
    const result3 = await retrieveRelevantChunks(
      `@${docId} extract personal information`,
      userId,
      5
    );
    
    console.log("✅ Result:", result3);
    console.log("📄 First chunk preview:", result3[0]?.substring(0, 200) + "...");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 4: General search without document mention
  console.log("📋 Test 4: General search without document mention");
  console.log("Query: what name is mentioned in my documents");
  
  try {
    const result4 = await retrieveRelevantChunks(
      "what name is mentioned in my documents",
      userId,
      5
    );
    
    console.log("✅ Result:", result4);
    console.log("📄 First chunk preview:", result4[0]?.substring(0, 200) + "...");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n✅ Document search tests completed!");
}

// Run the test
testDocumentSearch().catch(console.error);
