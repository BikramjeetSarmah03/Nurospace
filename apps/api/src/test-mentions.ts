// Test script for mention functionality
import {
  validateMentionMapping,
  getAvailableMentionOptions,
  processMentionWithQueryModification,
  isDirectToolMention,
} from "./lib/mention-system";

console.log("🧪 Testing Mention Functionality\n");

// Test 1: Validate frontend-backend mapping
console.log("1️⃣ Validating Frontend-Backend Mapping:");
const validation = validateMentionMapping();
console.log(`Valid: ${validation.valid}`);
console.log(`Issues: ${validation.issues.length}`);

if (validation.issues.length > 0) {
  console.log("Issues found:");
  validation.issues.forEach((issue) => console.log(`  ❌ ${issue}`));
}

console.log("\nMappings:");
validation.mappings.forEach((mapping) => {
  console.log(`  ${mapping.status} ${mapping.frontend} -> ${mapping.backend}`);
});

// Test 2: Get available mention options
console.log("\n2️⃣ Available Mention Options:");
const mentionOptions = getAvailableMentionOptions();
mentionOptions.forEach((option) => {
  console.log(`  📋 ${option.name} (${option.id}) - ${option.description}`);
});

// Test 3: Test mention processing with distinction
console.log("\n3️⃣ Testing Mention Processing (Agent vs Document):");
const testCases = [
  "@search-youtube Python tutorials",
  "@search-web latest AI news",
  "@search-workspace analyze my document",
  "@research machine learning trends",
  "@invalid-mention test query",
  "@resume.pdf analyze this document", // Document mention
  "@contract.docx what does this say", // Document mention
  "@search-youtube AND @resume.pdf analyze both", // Mixed mentions
];

testCases.forEach((testCase) => {
  const mentionPattern = /@(\w+)/g;
  const mentions = testCase.match(mentionPattern);

  if (mentions) {
    console.log(`\n📝 Query: "${testCase}"`);
    mentions.forEach((mention) => {
      const mentionId = mention.replace("@", "");
      const isDirectTool = isDirectToolMention(mentionId);
      const processed = processMentionWithQueryModification(
        mentionId,
        testCase,
      );

      if (isDirectTool) {
        if (processed) {
          console.log(
            `  ✅ ${mention} -> ${processed.toolName} (${processed.modifiedQuery}) [DIRECT TOOL]`,
          );
        } else {
          console.log(`  ❌ ${mention} -> No mapping found [DIRECT TOOL]`);
        }
      } else {
        console.log(`  📄 ${mention} -> Document mention, will follow AI flow`);
      }
    });
  }
});

console.log("\n✅ Mention functionality test completed!");
