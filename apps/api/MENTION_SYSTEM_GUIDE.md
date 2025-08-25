# 🎯 Mention System Implementation Guide

## 📋 Overview

The mention system allows users to directly invoke backend tools using `@mention` syntax in their queries. When **agent mentions** are detected, the system bypasses AI processing and executes tools directly for faster, more reliable results. **Document mentions** follow the normal AI flow for better context understanding.

## 🚀 How It Works

### 1. **Two Types of Mentions**

#### **Agent Mentions** (Direct Tool Calls)
```typescript
// These bypass AI and execute tools directly
"@search-youtube" -> "youtubeSearch"
"@search-web" -> "tavilySearch"
"@search-workspace" -> "retrieveRelevantChunks"
"@research" -> "tavilySearch"
```

#### **Document Mentions** (Normal AI Flow)
```typescript
// These follow normal AI processing for better context
"@resume.pdf" -> Normal AI flow with document context
"@contract.docx" -> Normal AI flow with document context
"@my-document" -> Normal AI flow with document context
```

### 2. **Direct Tool Execution Flow**
```
User Input: "@search-youtube Python tutorials"
↓
1. Detect mentions: ["@search-youtube"]
2. Check type: Agent mention (direct tool)
3. Map to tool: "youtubeSearch"
4. Modify query: "Python tutorials video tutorial"
5. Execute tool directly
6. Format beautiful response
7. Return immediately (bypass AI)
```

### 3. **Document Mention Flow**
```
User Input: "@resume.pdf analyze my experience"
↓
1. Detect mentions: ["@resume.pdf"]
2. Check type: Document mention (AI flow)
3. Skip direct tool execution
4. Follow normal AI processing
5. AI uses document context for analysis
6. Return AI-generated response
```

## 🛠️ Implementation Details

### **Core Components**

1. **Mention Handler** (`lib/mention-handler.ts`)
   - Maps frontend mentions to backend tools
   - Distinguishes between agent and document mentions
   - Processes query modifications for agent mentions only

2. **Chat Service** (`modules/chat/chat.service.ts`)
   - Detects mentions in user queries
   - Executes direct tool calls for agent mentions only
   - Lets document mentions follow normal AI flow

3. **Tool Integration** (`tool/tool.index.ts`)
   - YouTube search tool
   - Web search tool
   - Document search tool

### **Response Formatting**

```markdown
🎯 **Direct Tool Execution Results**

**Original Query:** @search-youtube Python tutorials

✅ **Successful Executions:**

**1. 🎥 YouTube Search**
🔍 Query: "Python tutorials video tutorial"

🎥 **YouTube Search Results** (1,234 total results)

1. **Python Tutorial for Beginners**
   📺 Channel: Programming with Mosh
   📅 Published: 12/15/2023
   🔗 URL: https://www.youtube.com/watch?v=abc123
   📝 Description: Learn Python programming from scratch...

---

📊 **Summary:** 1 successful, 0 failed
⚡ *Executed via direct tool calls*
```

## 🔧 API Endpoints

### **Get Available Mentions**
```bash
GET /api/v1/chat/mention-options
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "search-youtube",
      "name": "Search YouTube",
      "type": "youtube",
      "description": "Search YouTube for videos and content",
      "category": "agent"
    }
  ]
}
```

### **Validate Mention Mapping**
```bash
GET /api/v1/chat/validate-mentions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [],
    "mappings": [
      {
        "frontend": "search-youtube",
        "backend": "youtubeSearch",
        "status": "✅ Valid"
      }
    ]
  }
}
```

## 📝 Usage Examples

### **Agent Mentions (Direct Tool Calls)**
```
User: "@search-youtube React tutorials for beginners"
Result: Direct YouTube API search with formatted video results

User: "@search-web latest AI news 2024"
Result: Direct Tavily search with current news articles

User: "@research machine learning trends"
Result: Direct web search for research information
```

### **Document Mentions (AI Flow)**
```
User: "@resume.pdf analyze my experience"
Result: AI analyzes the resume with full context understanding

User: "@contract.docx what are the key terms?"
Result: AI reads and explains the contract terms

User: "@my-document summarize this"
Result: AI provides intelligent summary of the document
```

### **Mixed Mentions**
```
User: "@search-youtube AND @resume.pdf analyze both"
Result: 
- YouTube search executed directly
- Resume analysis follows AI flow
- Combined response with both results
```

## 🎨 Frontend Integration

### **Mention Options Structure**
```typescript
interface MentionOption {
  id: string;           // "search-youtube" or "resume.pdf"
  name: string;         // "Search YouTube" or "resume.pdf"
  type: string;         // "youtube" or "document"
  description: string;  // Description
  category: "agent" | "files";
}
```

### **Frontend Display**
```typescript
// Agent mentions (direct tools)
const agentMentions = [
  {
    id: "search-youtube",
    name: "Search YouTube",
    icon: <YoutubeIcon />,
    description: "Find video tutorials and content"
  },
  {
    id: "search-web", 
    name: "Search Web",
    icon: <GlobeIcon />,
    description: "Search the internet for current information"
  }
];

// Document mentions (AI flow)
const documentMentions = [
  {
    id: "resume.pdf",
    name: "resume.pdf",
    icon: <FileIcon />,
    description: "Analyze my resume"
  }
];
```

## 🔍 Validation & Testing

### **Run Validation**
```bash
# Test mention functionality
npm run test:mentions

# Or run the test script directly
npx tsx src/test-mentions.ts
```

### **Validation Checks**
1. ✅ All agent mentions map to existing backend tools
2. ✅ Document mentions are excluded from direct tool calls
3. ✅ Query modification works correctly for agent mentions
4. ✅ Error handling for invalid mentions

## 🚨 Error Handling

### **Invalid Mentions**
```
User: "@invalid-mention test"
Result: "❌ Mention '@invalid-mention' not supported"
```

### **Tool Execution Errors**
```
User: "@search-youtube test"
Result: "❌ Error: YouTube API key not configured"
```

### **Document Mentions**
```
User: "@resume.pdf analyze this"
Result: Follows normal AI flow with document context
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Required for YouTube search
YOUTUBE_API_KEY=your_youtube_api_key

# Required for web search  
TAVILY_API_KEY=your_tavily_key

# Required for weather
OPENWEATHER_API_KEY=your_weather_key
```

### **Adding New Mentions**
1. **Agent Mentions**: Add tool to `tool-config.ts` and mapping in `mention-handler.ts`
2. **Document Mentions**: No configuration needed, they follow AI flow automatically

## 📊 Performance Benefits

- **Speed**: Direct tool calls bypass AI processing for agent mentions
- **Reliability**: No LLM hallucinations for tool-based queries
- **Accuracy**: Direct API results without interpretation
- **Context**: Document mentions get full AI understanding
- **Cost**: Reduced token usage for simple tool queries

## 🎯 Best Practices

1. **Use agent mentions for specific tool needs** (`@search-youtube`, `@search-web`)
2. **Use document mentions for analysis** (`@resume.pdf`, `@contract.docx`)
3. **Combine mentions for complex queries**
4. **Validate mention mappings regularly**
5. **Monitor tool execution errors**

## 🔮 Future Enhancements

- [ ] Support for mention combinations (`@search-web AND @search-youtube`)
- [ ] Mention aliases (`@yt` for `@search-youtube`)
- [ ] Dynamic mention suggestions based on query
- [ ] Mention usage analytics
- [ ] Custom mention configurations per user
