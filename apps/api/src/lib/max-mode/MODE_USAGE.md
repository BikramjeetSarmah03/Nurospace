# 🚀 MAX MODE Usage Guide

## Frontend Mode Control

The chat API now supports explicit mode selection through the request payload. This gives users control over which processing mode they want to use.

## Request Format

```typescript
// POST /api/chat
{
  "msg": "Your message here",
  "mode": "max" | "normal" | undefined,
  "slug": "optional-chat-slug"
}
```

## Mode Options

### 1. **"max"** - Enhanced AI Processing
- **Use when**: You want comprehensive, multi-step analysis
- **Best for**: Complex queries, research, analysis, comparisons
- **Features**: 
  - Query decomposition into sub-questions
  - Multi-tool execution
  - Quality assessment
  - Professional response enhancement
  - Performance metrics

### 2. **"normal"** - Standard Processing
- **Use when**: You want quick, direct responses
- **Best for**: Simple questions, greetings, basic queries
- **Features**:
  - Single-pass processing
  - Faster response times
  - Standard tool selection
  - Direct answers

### 3. **undefined/auto** - Automatic Detection
- **Use when**: You want the system to decide
- **Behavior**: System analyzes query complexity and chooses automatically
- **Logic**: 
  - Complex queries → MAX mode
  - Simple queries → Normal mode

## Response Format

All responses now include a mode indicator:

```
[Your AI response content here]

[MODE]:max|normal|error
[CHAT_SLUG]:your-chat-slug
```

## Examples

### Frontend Request Examples

```typescript
// Force MAX mode for complex analysis
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    msg: "Analyze and compare the latest AI developments in 2024",
    mode: "max"
  })
});

// Force normal mode for simple query
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    msg: "What's the weather like?",
    mode: "normal"
  })
});

// Let system decide (auto-detection)
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    msg: "Hello, how are you?",
    // mode not specified - system will auto-detect
  })
});
```

### Response Examples

#### MAX Mode Response
```
🚀 **Comprehensive AI Analysis**

Based on my research and analysis of the latest AI developments in 2024, here's what I found:

**Key Trends:**
- Generative AI continues to advance rapidly
- Multimodal models are becoming mainstream
- AI safety and ethics are gaining prominence

**Notable Developments:**
- GPT-5 and similar models show significant improvements
- AI in healthcare is expanding rapidly
- Quantum AI research is accelerating

**Recommendations:**
- Stay updated with AI safety guidelines
- Consider AI integration for your business needs
- Monitor regulatory developments

---

🔍 **ANALYSIS INSIGHTS**
⚡ **Processing Time**: 45000ms
📊 **Quality Metrics**:
   • Accuracy: 95.0%
   • Completeness: 90.0%
   • Source Attribution: 100.0%

💡 **Recommendations for Better Results**:
   • Consider asking for specific AI domains
   • Upload relevant research papers for deeper analysis

🚀 *Powered by MAX MODE - Enhanced AI Analysis*

[MODE]:max
[CHAT_SLUG]:ai-analysis-2024-abc123
```

#### Normal Mode Response
```
The weather is currently sunny with a temperature of 22°C. It's a beautiful day!

[MODE]:normal
[CHAT_SLUG]:weather-query-def456
```

## When to Use Each Mode

### Use MAX Mode For:
- 🔍 **Research queries**: "Research the impact of climate change"
- 📊 **Analysis requests**: "Analyze the pros and cons of remote work"
- 🔄 **Comparisons**: "Compare React vs Vue.js for web development"
- 📈 **Complex questions**: "What are the implications of AI on job markets?"
- 🎯 **Comprehensive answers**: "Give me a detailed breakdown of..."

### Use Normal Mode For:
- 👋 **Greetings**: "Hello", "How are you?"
- ⏰ **Simple queries**: "What time is it?"
- 🌤️ **Basic info**: "What's the weather like?"
- 📅 **Date/time**: "What day is it today?"
- ❓ **Quick questions**: "Can you help me?"

## Implementation Notes

### Frontend Integration
```typescript
// Example: Smart mode selection based on query length
function selectMode(query: string): "max" | "normal" | undefined {
  if (query.length > 100) return "max";
  if (query.length < 20) return "normal";
  return undefined; // Let system decide
}

// Example: User preference toggle
const userPrefersMaxMode = user.settings?.preferMaxMode || false;
const mode = userPrefersMaxMode ? "max" : undefined;
```

### Error Handling
```typescript
// Handle mode-specific errors
if (response.includes('[MODE]:error')) {
  console.error('Processing failed');
  // Show error message to user
}
```

### Performance Monitoring
```typescript
// Track mode usage for analytics
const mode = response.match(/\[MODE\]:(\w+)/)?.[1];
analytics.track('chat_mode_used', { mode, query });
```

## Best Practices

1. **Let users choose**: Provide mode selection UI when appropriate
2. **Default to auto**: Use undefined mode for most queries
3. **Educate users**: Explain the difference between modes
4. **Monitor performance**: Track which modes users prefer
5. **Fallback gracefully**: If MAX mode fails, fall back to normal

## Troubleshooting

### Common Issues

1. **MAX mode not activating**: Check if query meets complexity criteria
2. **Slow responses**: MAX mode takes longer but provides better quality
3. **Mode not respected**: Ensure payload format is correct
4. **Unexpected behavior**: Check console logs for mode selection details

### Debug Information

The system logs detailed mode selection information:
```
[MODE SELECTION] Frontend requested: "max", Auto-detected: false, Final decision: MAX
[MODE SELECTION] Frontend requested: "auto", Auto-detected: true, Final decision: MAX
[MODE SELECTION] Frontend requested: "normal", Auto-detected: true, Final decision: NORMAL
```

This helps debug any mode selection issues.
