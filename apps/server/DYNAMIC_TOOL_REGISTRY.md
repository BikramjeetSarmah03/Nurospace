# Dynamic Tool Registry System

A production-grade tool registry that enables runtime tool discovery, loading, and registration without code changes.

## 🚀 **Overview**

The Dynamic Tool Registry allows you to:
- **Register new tools at runtime** without redeploying code
- **Discover tools** based on queries and tasks
- **Version and manage tools** with full lifecycle support
- **Monitor tool usage** with analytics and performance metrics
- **Control access** with role-based permissions
- **Rate limit tools** to prevent abuse

## 🏗️ **Architecture**

### **Core Components**

1. **ToolRegistry**: Singleton service for tool management
2. **ToolDiscoveryService**: ML-powered tool discovery and suggestions
3. **ToolVersioningService**: Version control and rollback capabilities
4. **Database Schema**: Persistent storage for tools, versions, and analytics
5. **API Routes**: RESTful endpoints for tool management

### **Key Features**

- **Runtime Registration**: Add tools without code changes
- **Metadata Management**: Rich tool descriptions, tags, and categories
- **Version Control**: Track tool versions and rollback capabilities
- **Usage Analytics**: Monitor performance and usage patterns
- **Rate Limiting**: Prevent abuse with configurable limits
- **Access Control**: Role-based permissions for tool management
- **Discovery**: AI-powered tool suggestions based on tasks

## 📊 **Database Schema**

### **Tables**

1. **tools**: Core tool metadata and configuration
2. **tool_versions**: Version history and rollback support
3. **tool_executions**: Usage analytics and performance tracking
4. **tool_rate_limits**: Rate limiting configuration
5. **tool_categories**: Tool categorization
6. **tool_permissions**: Access control
7. **tool_feedback**: User feedback and evaluation

## 🔧 **API Endpoints**

### **Tool Management**

```bash
# Get all tools
GET /api/v1/tools

# Search tools
GET /api/v1/tools/search?query=weather&category=utility

# Get tool by ID
GET /api/v1/tools/:toolId

# Create new tool
POST /api/v1/tools

# Update tool
PUT /api/v1/tools/:toolId

# Delete tool
DELETE /api/v1/tools/:toolId

# Execute tool
POST /api/v1/tools/:toolId/execute

# Get tool statistics
GET /api/v1/tools/:toolId/stats

# Discover tools for task
POST /api/v1/tools/discover

# Get tool categories
GET /api/v1/tools/categories
```

## 🛠️ **Usage Examples**

### **1. Register a New Tool**

```typescript
import { ToolRegistry, ToolCategory } from "@/lib/tool-registry";

const registry = ToolRegistry.getInstance();

await registry.registerTool({
  metadata: {
    id: "custom_weather_tool",
    name: "Custom Weather Tool",
    description: "Get detailed weather information for any location",
    version: "1.0.0",
    category: ToolCategory.UTILITY,
    tags: ["weather", "location", "api"],
    author: "user123",
    isActive: true,
    configSchema: {
      apiKey: { type: "string", required: true },
      units: { type: "string", enum: ["metric", "imperial"] }
    },
    examples: [
      "Get weather for New York",
      "What's the temperature in London?"
    ],
    rateLimit: {
      requests: 100,
      window: 3600 // 1 hour
    }
  },
  handler: async (input: string, context: ToolExecutionContext) => {
    // Your tool logic here
    const weather = await fetchWeatherData(input);
    return `Weather: ${weather.description}, ${weather.temperature}°C`;
  },
  validator: (input: string) => {
    if (!input.trim()) {
      return { isValid: false, errors: ["Input cannot be empty"] };
    }
    return { isValid: true, errors: [] };
  }
});
```

### **2. Discover Tools for a Task**

```typescript
import { ToolDiscoveryService } from "@/lib/tool-registry";

const discoveryService = new ToolDiscoveryService();

const suggestedTools = await discoveryService.suggestTools(
  "I need to analyze sales data and create a report",
  {
    userId: "user123",
    sessionId: "session456",
    requestId: "req789",
    metadata: {}
  }
);

console.log("Suggested tools:", suggestedTools);
// Output: [data_analysis_tool, report_generator_tool, ...]
```

### **3. Execute a Tool**

```typescript
const registry = ToolRegistry.getInstance();

const result = await registry.executeTool(
  "custom_weather_tool",
  "New York",
  {
    userId: "user123",
    sessionId: "session456",
    requestId: "req789",
    metadata: { priority: "high" }
  }
);

console.log("Tool result:", result);
```

### **4. Get Tool Analytics**

```typescript
const stats = await registry.getToolUsageStats(
  "custom_weather_tool",
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  }
);

console.log("Tool statistics:", stats);
// Output: { totalExecutions: 150, successRate: 98.5, averageResponseTime: 245, ... }
```

## 🔍 **Tool Discovery**

### **Categories**

- **SEARCH**: Web search, document search, vector search
- **DATA**: Data analysis, processing, transformation
- **COMMUNICATION**: Email, messaging, notifications
- **AUTOMATION**: Workflow automation, scheduling
- **ANALYTICS**: Reporting, metrics, insights
- **INTEGRATION**: Third-party API integrations
- **UTILITY**: Helper tools, utilities
- **CUSTOM**: User-defined tools

### **Discovery Algorithm**

The discovery service uses a relevance scoring algorithm:

1. **Name Matching**: 10 points for exact name matches
2. **Description Matching**: 5 points for description relevance
3. **Tag Matching**: 3 points per matching tag
4. **Category Relevance**: 2 points for category match

## 📈 **Analytics & Monitoring**

### **Metrics Tracked**

- **Execution Count**: Total tool invocations
- **Success Rate**: Percentage of successful executions
- **Response Time**: Average execution duration
- **Error Rate**: Failed execution tracking
- **User Usage**: Per-user tool usage patterns
- **Rate Limit Violations**: Abuse prevention metrics

### **Performance Monitoring**

```typescript
// Monitor slow tools
const slowTools = await db
  .select()
  .from(toolExecutions)
  .where(gt(toolExecutions.duration, 5000)) // > 5 seconds
  .orderBy(desc(toolExecutions.duration));

// Track error patterns
const errorPatterns = await db
  .select()
  .from(toolExecutions)
  .where(eq(toolExecutions.success, false))
  .groupBy(toolExecutions.toolId, toolExecutions.error);
```

## 🔐 **Security & Access Control**

### **Rate Limiting**

```typescript
// Configure rate limits
const tool = await registry.getToolById("api_tool");
if (tool?.metadata.rateLimit) {
  const { requests, window } = tool.metadata.rateLimit;
  // Allow 'requests' calls per 'window' seconds
}
```

### **Permissions**

- **owner**: Full control over tool
- **editor**: Can modify tool configuration
- **viewer**: Can view tool details
- **executor**: Can only execute tool

### **Input Validation**

```typescript
const validator = (input: string) => {
  const errors: string[] = [];
  
  if (!input.trim()) {
    errors.push("Input cannot be empty");
  }
  
  if (input.length > 1000) {
    errors.push("Input too long (max 1000 characters)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## 🚀 **Integration with LangChain**

### **Dynamic Tool Loading**

```typescript
import { getDynamicToolset } from "@/tool/tool.index";

// In your agent creation
const tools = await getDynamicToolset();
const agent = createReactAgent({
  llm,
  tools,
  // ... other config
});
```

### **Context-Aware Execution**

```typescript
// Tools receive execution context
const handler = async (input: string, context: ToolExecutionContext) => {
  const { userId, sessionId, requestId, metadata } = context;
  
  // Use context for logging, permissions, etc.
  logger.info("Tool executed", { userId, toolId, input });
  
  // Your tool logic
  return result;
};
```

## 🔄 **Version Management**

### **Version History**

```typescript
import { ToolVersioningService } from "@/lib/tool-registry";

const versioningService = new ToolVersioningService();

// Get version history
const history = await versioningService.getToolVersionHistory("tool_id");

// Rollback to previous version
await versioningService.rollbackTool("tool_id", "1.2.0");

// Compare versions
const diff = await versioningService.compareToolVersions("tool_id", "1.1.0", "1.2.0");
```

## 📋 **Best Practices**

### **Tool Design**

1. **Clear Descriptions**: Write detailed, specific descriptions
2. **Proper Categorization**: Use appropriate categories and tags
3. **Input Validation**: Always validate inputs
4. **Error Handling**: Graceful error handling and logging
5. **Rate Limiting**: Configure appropriate rate limits
6. **Documentation**: Provide examples and usage instructions

### **Performance**

1. **Caching**: Use the built-in caching system
2. **Async Operations**: Handle long-running operations properly
3. **Resource Management**: Clean up resources after execution
4. **Monitoring**: Track performance metrics

### **Security**

1. **Input Sanitization**: Validate and sanitize all inputs
2. **Access Control**: Implement proper permissions
3. **Rate Limiting**: Prevent abuse
4. **Audit Logging**: Log all tool executions

## 🎯 **Next Steps**

1. **Database Migration**: Run the tool schema migrations
2. **Initialize Registry**: Call `initializeBuiltInTools()` on startup
3. **API Testing**: Test the tool registry endpoints
4. **Integration**: Update your agent to use `getDynamicToolset()`
5. **Monitoring**: Set up alerts for tool performance
6. **Documentation**: Document your custom tools

## 🔗 **Related Files**

- `apps/server/src/lib/tool-registry.ts` - Core registry implementation
- `apps/server/src/db/schema/tool.ts` - Database schema
- `apps/server/src/routers/tool-registry.routes.ts` - API routes
- `apps/server/src/tool/tool.index.ts` - Integration with existing tools

Your Nurospace platform now has a **production-ready dynamic tool registry**! 🚀 