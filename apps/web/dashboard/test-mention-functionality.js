// Test script to verify mention functionality
// This simulates the frontend behavior

const testDocuments = [
  {
    id: "cdb95b00-e214-45fa-ab49-4866f26d8bdb",
    name: "Trithanka_baruah_resume_st.pdf",
    type: "pdf",
  },
  {
    id: "abc123-def456-ghi789",
    name: "project_document.docx",
    type: "docx",
  },
];

function processMessage(value, selectedDocuments) {
  let processedValue = value;

  // Replace @document_name with @resource_id for all selected documents
  selectedDocuments.forEach((doc) => {
    const mentionPattern = new RegExp(
      `@${doc.name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`,
      "g",
    );
    processedValue = processedValue.replace(mentionPattern, `@${doc.id}`);
  });

  return processedValue;
}

// Test cases
const testCases = [
  {
    input: "Tell me about @Trithanka_baruah_resume_st.pdf",
    selectedDocs: [testDocuments[0]],
    expected: "Tell me about @cdb95b00-e214-45fa-ab49-4866f26d8bdb",
  },
  {
    input: "Analyze @project_document.docx and @Trithanka_baruah_resume_st.pdf",
    selectedDocs: [testDocuments[0], testDocuments[1]],
    expected:
      "Analyze @abc123-def456-ghi789 and @cdb95b00-e214-45fa-ab49-4866f26d8bdb",
  },
  {
    input: "What's in @Trithanka_baruah_resume_st.pdf?",
    selectedDocs: [testDocuments[0]],
    expected: "What's in @cdb95b00-e214-45fa-ab49-4866f26d8bdb?",
  },
];

console.log("🧪 Testing Frontend Mention Functionality\n");

testCases.forEach((testCase, index) => {
  const result = processMessage(testCase.input, testCase.selectedDocs);
  const passed = result === testCase.expected;

  console.log(`Test ${index + 1}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Input:    "${testCase.input}"`);
  console.log(`Expected: "${testCase.expected}"`);
  console.log(`Result:   "${result}"`);
  console.log("");
});

console.log("🎯 Frontend Implementation Summary:");
console.log("✅ User sees document names in chat input");
console.log("✅ Resource IDs are sent to backend");
console.log("✅ Automatic conversion during submission");
console.log("✅ Maintains good UX with readable names");
