// 🚀 MAX MODE EXECUTION ORCHESTRATOR - Multi-Step Tool Execution
import { getLLM } from "../llm";
import { MAX_MODE_CONFIG } from "./max-mode-config";
import { type QueryDecomposition, SubQuestion } from "./max-query-decomposer";
import { toolset } from "../../tool/tool.index";

export interface ExecutionStep {
  id: string;
  subQuestionId: string;
  question: string;
  tools: string[];
  status: "pending" | "executing" | "completed" | "failed";
  result?: any;
  error?: string;
  confidence: number;
  executionTime: number;
}

export interface ExecutionResult {
  originalQuery: string;
  decomposition: QueryDecomposition;
  steps: ExecutionStep[];
  finalResponse: string;
  overallConfidence: number;
  totalExecutionTime: number;
  sources: string[];
}

export class MaxExecutionOrchestrator {
  private llm = getLLM(MAX_MODE_CONFIG.llm.primaryModel as any);
  private executionSteps: ExecutionStep[] = [];
  private startTime = 0;

  async executeQuery(
    query: string,
    decomposition: QueryDecomposition,
    userId?: string,
  ): Promise<ExecutionResult> {
    console.log("[MAX MODE] 🚀 Starting execution for:", query);

    this.startTime = Date.now();
    this.executionSteps = [];

    try {
      // Initialize execution steps
      await this.initializeExecutionSteps(decomposition);

      // Execute steps in order
      await this.executeStepsSequentially(decomposition, userId);

      // Synthesize final response
      const finalResponse = await this.synthesizeFinalResponse(decomposition);

      const result: ExecutionResult = {
        originalQuery: query,
        decomposition,
        steps: this.executionSteps,
        finalResponse,
        overallConfidence: this.calculateOverallConfidence(),
        totalExecutionTime: Date.now() - this.startTime,
        sources: this.extractSources(),
      };

      console.log("[MAX MODE] ✅ Execution completed:", {
        steps: this.executionSteps.length,
        time: `${result.totalExecutionTime}ms`,
        confidence: `${(result.overallConfidence * 100).toFixed(1)}%`,
      });

      return result;
    } catch (error) {
      console.error("[MAX MODE] ❌ Execution failed:", error);
      throw error;
    }
  }

  private async initializeExecutionSteps(
    decomposition: QueryDecomposition,
  ): Promise<void> {
    for (const subQuestion of decomposition.subQuestions) {
      const step: ExecutionStep = {
        id: `step_${subQuestion.id}`,
        subQuestionId: subQuestion.id,
        question: subQuestion.question,
        tools: subQuestion.expectedTools,
        status: "pending",
        confidence: subQuestion.confidence,
        executionTime: 0,
      };

      this.executionSteps.push(step);
    }
  }

  private async executeStepsSequentially(
    decomposition: QueryDecomposition,
    userId?: string,
  ): Promise<void> {
    for (const stepId of decomposition.executionOrder) {
      const step = this.executionSteps.find((s) => s.subQuestionId === stepId);
      if (!step) continue;

      console.log(`[MAX MODE] 🎯 Executing: ${step.question}`);

      try {
        step.status = "executing";
        const stepStartTime = Date.now();

        const result = await this.executeStep(step, userId);

        step.status = "completed";
        step.result = result;
        step.executionTime = Date.now() - stepStartTime;
      } catch (error) {
        console.error(`[MAX MODE] ❌ Step failed: ${step.question}`, error);
        step.status = "failed";
        step.error = error instanceof Error ? error.message : "Unknown error";
      }
    }
  }

  private async executeStep(
    step: ExecutionStep,
    userId?: string,
  ): Promise<any> {
    const results: any[] = [];

    for (const toolName of step.tools) {
      try {
        const tool = toolset.find((t) => t.name === toolName);
        if (!tool) continue;

        const toolResult = await this.executeToolWithMaxMode(
          tool,
          step.question,
          userId,
        );
        results.push({
          tool: toolName,
          result: toolResult,
          confidence: this.calculateToolConfidence(toolName, toolResult),
        });
      } catch (error) {
        results.push({
          tool: toolName,
          error: error instanceof Error ? error.message : "Unknown error",
          confidence: 0,
        });
      }
    }

    return results;
  }

  private async executeToolWithMaxMode(
    tool: any,
    question: string,
    userId?: string,
  ): Promise<any> {
    const enhancedParams = {
      query: question,
      userId,
      mode: "max",
      maxResults: 10,
      enableDetailedOutput: true,
    };

    try {
      if (tool.name === "retrieveRelevantChunks") {
        return await tool.invoke(question, { configurable: { userId } });
      }
      if (tool.name === "tavilySearch") {
        return await tool.invoke(question, { configurable: { userId } });
      }
      return await tool.invoke(question, { configurable: { userId } });
    } catch (error) {
      throw error;
    }
  }

  private calculateToolConfidence(toolName: string, result: any): number {
    let baseConfidence = 0.8;

    if (toolName === "retrieveRelevantChunks") {
      if (result && Array.isArray(result) && result.length > 0) {
        baseConfidence = Math.min(0.9, 0.7 + result.length * 0.02);
      } else {
        baseConfidence = 0.3;
      }
    } else if (toolName === "tavilySearch") {
      if (result && result.length > 0) {
        baseConfidence = 0.85;
      } else {
        baseConfidence = 0.4;
      }
    }

    return baseConfidence;
  }

  private async synthesizeFinalResponse(
    decomposition: QueryDecomposition,
  ): Promise<string> {
    const completedSteps = this.executionSteps.filter(
      (s) => s.status === "completed",
    );
    if (completedSteps.length === 0) {
      return "I apologize, but I was unable to complete the analysis due to execution failures.";
    }

    const prompt = `Synthesize a comprehensive response based on this analysis:

Original Query: "${decomposition.originalQuery}"
Intent: ${decomposition.intent}

Analysis Steps:
${completedSteps
  .map(
    (step) => `
- ${step.question}
  Result: ${JSON.stringify(step.result, null, 2)}
`,
  )
  .join("\n")}

Provide a comprehensive, well-structured response that directly answers the original query and incorporates insights from all successful analysis steps.`;

    try {
      const response = await this.llm.invoke(prompt);
      return response.content?.toString() || "Unable to synthesize response";
    } catch (error) {
      return this.createFallbackResponse(completedSteps);
    }
  }

  private createFallbackResponse(completedSteps: ExecutionStep[]): string {
    let response = "Based on my analysis:\n\n";

    for (const step of completedSteps) {
      response += `**${step.question}**\n`;
      if (step.result && Array.isArray(step.result)) {
        for (const result of step.result) {
          if (result.result && !result.error) {
            response += `- ${JSON.stringify(result.result).substring(0, 200)}...\n`;
          }
        }
      }
      response += "\n";
    }

    return response;
  }

  private calculateOverallConfidence(): number {
    const completedSteps = this.executionSteps.filter(
      (s) => s.status === "completed",
    );
    if (completedSteps.length === 0) return 0;

    return (
      completedSteps.reduce((sum, step) => sum + step.confidence, 0) /
      completedSteps.length
    );
  }

  private extractSources(): string[] {
    const sources: string[] = [];

    for (const step of this.executionSteps) {
      if (step.result && Array.isArray(step.result)) {
        for (const result of step.result) {
          if (result.result?.sources) {
            sources.push(...result.result.sources);
          }
        }
      }
    }

    return [...new Set(sources)];
  }
}

export const maxExecutionOrchestrator = new MaxExecutionOrchestrator();
