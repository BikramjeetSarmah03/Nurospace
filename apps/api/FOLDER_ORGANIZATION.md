# 🗂️ NUROSPACE AI AGENT FOLDER ORGANIZATION

## 📁 **New Mode-Based Structure**

The codebase has been reorganized into mode-specific folders for better maintainability and clarity.

---

## 🎯 **NORMAL MODE** (`/lib/normal-mode/`)

**Purpose**: Semantic-based tool selection using embeddings

### **Files:**
```
normal-mode/
├── semantic-supervisor.ts        # Main supervisor implementation
├── semantic-tool-registry.ts    # Tool registry and embeddings
├── index.ts                      # Exports
└── README.md                     # Documentation
```

### **Key Features:**
- Semantic embeddings for tools
- Cosine similarity matching
- LLM-based supervisor decisions
- Lazy loading for performance

---

## 🚀 **POWER MODE** (`/lib/power-mode/`)

**Purpose**: Hybrid supervisor combining best of all modes

### **Files:**
```
power-mode/
├── hybrid-supervisor-agent.ts    # Main agent implementation
├── hybrid-supervisor-agent.test.ts # Test suite
├── HYBRID_SUPERVISOR_FLOW.md    # Flow documentation
├── index.ts                      # Exports
└── README.md                     # Documentation
```

### **Key Features:**
- 4-tier optimization strategy
- LLM-based intelligent routing
- Smart tool orchestration
- Production-ready architecture

---

## 🔥 **MAX MODE** (`/lib/max-mode/`)

**Purpose**: Advanced query decomposition and processing

### **Files:**
```
max-mode/
├── max-mode-supervisor.ts        # Main coordinator
├── max-query-decomposer.ts       # Query analysis
├── max-execution-orchestrator.ts # Tool execution
├── max-mode-config.ts            # Configuration
├── debug-test.ts                 # Testing utilities
├── integration-example.ts        # Usage examples
├── README.md                     # Documentation
├── MODE_USAGE.md                 # Usage guide
└── index.ts                      # Exports
```

### **Key Features:**
- Query decomposition
- Multi-step execution
- Quality assessment
- Enhanced response generation

---

## 🛠️ **Core Components** (`/lib/`)

**Shared utilities and configurations**

### **Files:**
```
lib/
├── agent.ts                      # Base agent creation
├── llm.ts                        # LLM model management
├── tool-config.ts                # Tool configurations
├── tool-registry.ts              # Tool management
└── index.ts                      # Main exports
```

---

## 📥 **Import Updates**

### **Before (Old Structure):**
```typescript
import { createHybridSupervisorAgent } from "@/lib/hybrid-supervisor-agent";
import { createSemanticSupervisor } from "@/lib/semantic-supervisor";
```

### **After (New Structure):**
```typescript
import { createHybridSupervisorAgent } from "@/lib/power-mode";
import { createSemanticSupervisor } from "@/lib/normal-mode";
```

---

## 🚀 **Benefits of New Organization**

### **✅ Maintainability**
- Clear separation of concerns
- Easy to find mode-specific code
- Reduced file conflicts

### **✅ Scalability**
- Easy to add new modes
- Independent development
- Clear dependencies

### **✅ Documentation**
- Mode-specific READMEs
- Clear usage examples
- Architecture documentation

### **✅ Testing**
- Isolated test suites
- Mode-specific testing
- Better test organization

---

## 🔄 **Migration Complete**

All imports have been updated to use the new folder structure:

- ✅ **Chat Service** - Updated to use `/lib/power-mode`
- ✅ **Agent Module** - Updated to use `/lib/normal-mode`
- ✅ **Main Index** - Centralized exports
- ✅ **Documentation** - Mode-specific guides

---

## 🎯 **Next Steps**

1. **Test the new structure** - Ensure all imports work correctly
2. **Update any remaining imports** - Check for missed references
3. **Add mode-specific features** - Enhance each mode independently
4. **Documentation updates** - Keep READMEs current

---

## 📚 **Usage Examples**

### **Using Normal Mode:**
```typescript
import { createSemanticSupervisor } from '@/lib/normal-mode';
const agent = await createSemanticSupervisor();
```

### **Using Power Mode:**
```typescript
import { createHybridSupervisorAgent } from '@/lib/power-mode';
const agent = createHybridSupervisorAgent();
```

### **Using Max Mode:**
```typescript
import { maxModeSupervisor } from '@/lib/max-mode';
const response = await maxModeSupervisor.processQuery(query);
```

---

**🎉 The codebase is now organized by mode for better maintainability and scalability!**
