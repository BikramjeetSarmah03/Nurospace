// 🚀 MAX MODE SYSTEM - Advanced AI Capabilities
// Export all MAX mode components for integration

export * from "./max-mode-config";
export * from "./max-query-decomposer";
export * from "./max-execution-orchestrator";
export * from "./max-mode-supervisor";

// Main MAX mode entry point
export { maxModeSupervisor } from "./max-mode-supervisor";
export { maxQueryDecomposer } from "./max-query-decomposer";
export { maxExecutionOrchestrator } from "./max-execution-orchestrator";

// Configuration access
export {
  MAX_MODE_CONFIG,
  getMaxModeConfig,
  getToolCombination,
  getQueryType,
  getExecutionStrategy,
} from "./max-mode-config";
