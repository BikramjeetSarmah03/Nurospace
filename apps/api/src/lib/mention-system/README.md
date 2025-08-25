# 🎯 Mention System

This folder contains all the mention-related functionality for the chat system. The mention system allows users to directly invoke backend tools using `@mention` syntax in their queries.

## 📁 File Structure

```
mention-system/
├── index.ts              # Main exports for the mention system
├── mention-handler.ts    # Core mention processing and mapping logic
├── mention-processor.ts  # Direct tool execution and response formatting
└── README.md            # This documentation
```

## 🔧 Components

### **mention-handler.ts**
- Maps frontend mention names to backend tool names
- Validates mention support and mappings
- Processes query modifications for different mention types
- Distinguishes between agent mentions and document mentions

### **mention-processor.ts**
- Handles direct tool execution for mentions
- Formats beautiful, user-friendly responses
- Manages error handling for tool execution
- Provides tool display names

### **index.ts**
- Central export point for all mention system functionality
- Re-exports types and functions for convenience

## 🚀 Usage

```typescript
import { processMentionsInQuery, getAvailableMentionOptions } from "@/lib/mention-system";

// Process mentions in a user query
const result = await processMentionsInQuery("@search-youtube Python tutorials");

// Get available mention options for frontend
const options = getAvailableMentionOptions();
```

## 🎯 Key Features

- **Agent Mentions**: Direct tool calls (e.g., `@search-youtube`, `@search-web`)
- **Document Mentions**: Follow normal AI flow (e.g., `@resume.pdf`, `@contract.docx`)
- **Query Modification**: Automatically enhances queries for better results
- **Beautiful Formatting**: User-friendly response formatting
- **Error Handling**: Comprehensive error management
- **Validation**: Frontend-backend mapping validation

## 🔄 Flow

1. **Detection**: System detects `@mention` patterns in user queries
2. **Classification**: Distinguishes between agent and document mentions
3. **Processing**: Agent mentions trigger direct tool execution
4. **Formatting**: Results are formatted into beautiful responses
5. **Return**: Direct tool results bypass AI processing

## 📊 Benefits

- **Speed**: Direct tool calls bypass AI processing
- **Reliability**: No LLM hallucinations for tool-based queries
- **Accuracy**: Direct API results without interpretation
- **Context**: Document mentions get full AI understanding
- **Cost**: Reduced token usage for simple tool queries
