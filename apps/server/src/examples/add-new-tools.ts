import { DynamicTool } from "@langchain/core/tools";

/**
 * Example: Adding new tools that will be automatically categorized
 */

// Example 1: Research Tool (will be auto-categorized as 'research')
export const emailSearchTool = new DynamicTool({
  name: "emailSearch",
  description: "Search through user's email messages for specific content or contacts",
  func: async (input: string) => {
    // Email search implementation
    return `Found emails matching: ${input}`;
  },
});

// Example 2: Analysis Tool (will be auto-categorized as 'analysis')
export const dataAnalyzerTool = new DynamicTool({
  name: "dataAnalyzer",
  description: "Analyze data sets and provide statistical insights",
  func: async (input: string) => {
    // Data analysis implementation
    return `Analysis results for: ${input}`;
  },
});

// Example 3: Execution Tool (will be auto-categorized as 'execution')
export const emailSenderTool = new DynamicTool({
  name: "emailSender",
  description: "Send emails to specified recipients with custom content",
  func: async (input: string) => {
    // Email sending implementation
    return `Email sent successfully: ${input}`;
  },
});

// Example 4: Complex Tool (will be auto-categorized as 'planning')
export const workflowOrchestratorTool = new DynamicTool({
  name: "workflowOrchestrator",
  description: "Orchestrate complex workflows involving multiple tools and steps",
  func: async (input: string) => {
    // Workflow orchestration implementation
    return `Workflow completed: ${input}`;
  },
});

/**
 * How to add these tools to your system:
 */

// Method 1: Add to existing toolset
export function addNewToolsToSystem() {
  // Import your existing toolset
  import { toolset } from "@/tool/tool.index";
  
  // Add new tools
  const newTools = [
    emailSearchTool,
    dataAnalyzerTool,
    emailSenderTool,
    workflowOrchestratorTool,
  ];
  
  // The supervisor will automatically categorize these tools based on their names and descriptions
  console.log("New tools added - they will be automatically categorized!");
  
  return [...toolset, ...newTools];
}

/**
 * Automatic categorization examples:
 */

// These tools will be automatically categorized as:
console.log("📧 emailSearchTool → research (contains 'search')");
console.log("📊 dataAnalyzerTool → analysis (contains 'analyze')");
console.log("📤 emailSenderTool → execution (contains 'send')");
console.log("🔄 workflowOrchestratorTool → planning (complex tool)");

/**
 * Manual override example:
 * If you want to override automatic categorization for specific tools
 */

// You can add manual overrides in the supervisor-agent.ts file:
const manualOverrides = {
  research: [
    "emailSearch", // Force this tool to research category
  ],
  analysis: [
    "dataAnalyzer", // Force this tool to analysis category
  ],
  execution: [
    "emailSender", // Force this tool to execution category
  ],
  planning: [
    "workflowOrchestrator", // Force this tool to planning category
  ],
};

/**
 * Testing the automatic categorization:
 */

export function testAutomaticCategorization() {
  const tools = [
    emailSearchTool,
    dataAnalyzerTool,
    emailSenderTool,
    workflowOrchestratorTool,
  ];

  console.log("🧪 Testing Automatic Tool Categorization:");
  
  tools.forEach(tool => {
    const name = tool.name.toLowerCase();
    const description = (tool.description || '').toLowerCase();
    
    let category = 'planning'; // default
    
    if (name.includes('search') || name.includes('find') || name.includes('retrieve') || 
        description.includes('search') || description.includes('find') || description.includes('gather')) {
      category = 'research';
    } else if (name.includes('analyze') || name.includes('calculate') || name.includes('compute') || 
               description.includes('analysis') || description.includes('calculation') || description.includes('data')) {
      category = 'analysis';
    } else if (name.includes('execute') || name.includes('send') || name.includes('perform') || 
               description.includes('action') || description.includes('execute') || description.includes('api')) {
      category = 'execution';
    }
    
    console.log(`✅ ${tool.name} → ${category} agent`);
  });
}

// Run the test
testAutomaticCategorization(); 