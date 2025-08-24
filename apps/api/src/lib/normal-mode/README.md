# 🎯 NORMAL MODE - Semantic Supervisor Agent

## Overview
NORMAL MODE uses semantic embeddings and intelligent tool selection to provide accurate and efficient query processing.

## 🏗️ Architecture

### **Semantic-Based Tool Selection**
- **Embedding Generation**: Creates semantic representations of tools
- **Similarity Matching**: Uses cosine similarity for tool selection
- **Intelligent Routing**: LLM-based supervisor for complex decisions

### **Key Components**
- **SemanticSupervisor**: Main coordination logic
- **SemanticToolRegistry**: Manages tool embeddings and selection
- **LLM Integration**: Uses Gemini models for intelligent processing

## 📁 File Structure
```
normal-mode/
├── semantic-supervisor.ts        # Main supervisor implementation
├── semantic-tool-registry.ts    # Tool registry and embeddings
├── index.ts                      # Exports
└── README.md                     # This file
```

## 🚀 Usage

```typescript
import { createSemanticSupervisor } from '@/lib/normal-mode';

const normalAgent = createSemanticSupervisor();
const response = await normalAgent.processQuery(messages, userId);
```

## 🔧 Features

- **Semantic Tool Selection**: Intelligent tool matching based on query intent
- **Embedding Caching**: Stores tool embeddings for performance
- **Fallback Mechanisms**: Robust error handling and recovery
- **Lazy Loading**: Efficient resource management
