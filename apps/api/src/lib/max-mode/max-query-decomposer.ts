// 🚀 MAX MODE QUERY DECOMPOSER - Break Complex Queries into Sub-Questions
import { getLLM } from "../llm";
import { MAX_MODE_CONFIG } from "./max-mode-config";

export interface SubQuestion {
  id: string;
  question: string;
  type: "research" | "analysis" | "comparison" | "verification" | "synthesis";
  priority: number;
  dependencies: string[];
  expectedTools: string[];
  confidence: number;
}

export interface QueryDecomposition {
  originalQuery: string;
  intent: string;
  subQuestions: SubQuestion[];
  executionOrder: string[];
  estimatedComplexity: "low" | "medium" | "high" | "critical";
  totalProcessingTime: number;
}

export class MaxQueryDecomposer {
  private llm = getLLM(MAX_MODE_CONFIG.llm.primaryModel as any);

  async decomposeQuery(
    query: string,
    userId?: string,
  ): Promise<QueryDecomposition> {
    console.log("[MAX MODE] 🔍 Decomposing query:", query);
    const startTime = Date.now();

    try {
      // Step 1: Intent Classification
      console.log("[MAX MODE] 🔍 Step 1: Intent classification...");
      const intent = await this.classifyIntent(query);
      console.log("[MAX MODE] ✅ Intent classified as:", intent);

      // Step 2: Generate Sub-Questions
      console.log("[MAX MODE] 🔍 Step 2: Generating sub-questions...");
      const subQuestions = await this.generateSubQuestions(query, intent);
      console.log(
        "[MAX MODE] ✅ Generated",
        subQuestions.length,
        "sub-questions",
      );

      // Step 3: Determine Execution Order
      console.log("[MAX MODE] 🔍 Step 3: Determining execution order...");
      const executionOrder = this.determineExecutionOrder(subQuestions);
      console.log("[MAX MODE] ✅ Execution order:", executionOrder);

      // Step 4: Calculate Complexity
      console.log("[MAX MODE] 🔍 Step 4: Calculating complexity...");
      const complexity = this.calculateComplexity(subQuestions);
      console.log("[MAX MODE] ✅ Complexity level:", complexity);

      // Step 5: Estimate Processing Time
      console.log("[MAX MODE] 🔍 Step 5: Estimating processing time...");
      const processingTime = this.estimateProcessingTime(
        subQuestions,
        complexity,
      );
      console.log(
        "[MAX MODE] ✅ Estimated processing time:",
        processingTime,
        "ms",
      );

      const decomposition: QueryDecomposition = {
        originalQuery: query,
        intent,
        subQuestions,
        executionOrder,
        estimatedComplexity: complexity,
        totalProcessingTime: processingTime,
      };

      const totalTime = Date.now() - startTime;
      console.log(
        "[MAX MODE] ✅ Query decomposed successfully in",
        totalTime,
        "ms:",
        {
          intent,
          subQuestionsCount: subQuestions.length,
          complexity,
          processingTime: `${processingTime}ms`,
          totalDecompositionTime: `${totalTime}ms`,
        },
      );

      return decomposition;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(
        "[MAX MODE] ❌ Query decomposition failed after",
        totalTime,
        "ms:",
        error,
      );

      // Fallback to simple decomposition
      console.log("[MAX MODE] 🔄 Using fallback decomposition...");
      return this.createFallbackDecomposition(query);
    }
  }

  private async classifyIntent(query: string): Promise<string> {
    const prompt = `Classify the intent of this query into one of these categories:
    - RESEARCH: Information gathering and fact-finding
    - ANALYSIS: Deep analysis and interpretation
    - COMPARISON: Comparing multiple sources or concepts
    - VERIFICATION: Fact checking and validation
    - SYNTHESIS: Combining information from multiple sources

    Query: "${query}"
    
    Respond with only the category name:`;

    try {
      const response = await this.llm.invoke(prompt);
      const intent =
        response.content?.toString().trim().toUpperCase() || "RESEARCH";
      return intent;
    } catch (error) {
      console.warn(
        "[MAX MODE] Intent classification failed, defaulting to RESEARCH",
      );
      return "RESEARCH";
    }
  }

  private async generateSubQuestions(
    query: string,
    intent: string,
  ): Promise<SubQuestion[]> {
    console.log("[MAX MODE] 🔍 Generating sub-questions for intent:", intent);

    // Check if LLM is properly initialized
    if (!this.llm || typeof this.llm.invoke !== "function") {
      console.warn(
        "[MAX MODE] ⚠️ LLM not properly initialized, using fallback sub-questions",
      );
      return this.createStructuredSubQuestions(query, intent);
    }

    const prompt = `Break down this complex query into 3-5 smaller, answerable sub-questions.

Original Query: "${query}"
Intent: ${intent}

IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanations, just JSON.

Format each sub-question as a JSON object with these exact properties:
{
  "question": "Clear, specific question",
  "type": "research|analysis|comparison|verification|synthesis",
  "priority": 1-5,
  "expectedTools": ["tool1", "tool2"],
  "dependencies": []
}

Example response:
[
  {
    "question": "What is the current state of AI in job markets?",
    "type": "research",
    "priority": 1,
    "expectedTools": ["tavilySearch"],
    "dependencies": []
  }
]

Respond with ONLY the JSON array:`;

    try {
      console.log(
        "[MAX MODE] 🔍 Sending prompt to LLM for sub-question generation...",
      );

      // // Add timeout to LLM call
      // const timeoutPromise = new Promise<never>((_, reject) => {
      //   setTimeout(() => reject(new Error('LLM sub-question generation timeout')), 15000); // 15 second timeout
      // });

      const response = await this.llm.invoke(prompt);

      if (!response || !response.content) {
        console.warn(
          "[MAX MODE] ⚠️ LLM returned empty response, using fallback",
        );
        return this.createStructuredSubQuestions(query, intent);
      }

      const content = response.content.toString();
      console.log(
        "[MAX MODE] 🔍 LLM response received, length:",
        content.length,
      );

      // Try to parse JSON response
      let subQuestions: any[] = [];
      try {
        // Clean the response - remove any markdown formatting
        const cleanedContent = content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        subQuestions = JSON.parse(cleanedContent);
        console.log(
          "[MAX MODE] ✅ JSON parsing successful, found",
          subQuestions.length,
          "sub-questions",
        );
      } catch (parseError) {
        console.warn("[MAX MODE] ⚠️ JSON parsing failed:", parseError);
        console.log(
          "[MAX MODE] 🔄 Creating structured sub-questions as fallback",
        );
        subQuestions = this.createStructuredSubQuestions(query, intent);
      }

      // Validate and structure sub-questions
      const validatedSubQuestions = subQuestions.map((q, index) => ({
        id: `sq_${index + 1}`,
        question: q.question || `Sub-question ${index + 1}`,
        type: q.type || "research",
        priority: q.priority || 1,
        dependencies: q.dependencies || [],
        expectedTools: q.expectedTools || ["tavilySearch"],
        confidence: 0.8,
      }));

      console.log(
        "[MAX MODE] ✅ Sub-questions generated successfully:",
        validatedSubQuestions.length,
      );
      return validatedSubQuestions;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn(
        "[MAX MODE] ⚠️ Sub-question generation failed:",
        errorMessage,
      );
      console.log("[MAX MODE] 🔄 Using fallback structured sub-questions");
      return this.createStructuredSubQuestions(query, intent);
    }
  }

  private createStructuredSubQuestions(
    query: string,
    intent: string,
  ): SubQuestion[] {
    console.log(
      "[MAX MODE] 🔄 Creating fallback structured sub-questions for intent:",
      intent,
    );

    // Create context-aware sub-questions based on the query content
    const normalizedQuery = query.toLowerCase();

    // Check if this is an AI/job market analysis query
    if (
      normalizedQuery.includes("artificial intelligence") ||
      normalizedQuery.includes("ai") ||
      normalizedQuery.includes("job market")
    ) {
      return [
        {
          id: "sq_1",
          question:
            "What is the current state of artificial intelligence adoption in job markets?",
          type: "research" as const,
          priority: 1,
          dependencies: [],
          expectedTools: ["tavilySearch"],
          confidence: 0.8,
        },
        {
          id: "sq_2",
          question:
            "What are the emerging trends in AI's impact on employment and workforce?",
          type: "analysis" as const,
          priority: 2,
          dependencies: ["sq_1"],
          expectedTools: ["tavilySearch", "retrieveRelevantChunks"],
          confidence: 0.8,
        },
        {
          id: "sq_3",
          question:
            "What strategies and recommendations exist for workforce adaptation to AI changes?",
          type: "synthesis" as const,
          priority: 3,
          dependencies: ["sq_1", "sq_2"],
          expectedTools: ["tavilySearch", "retrieveRelevantChunks"],
          confidence: 0.8,
        },
      ];
    }

    // Check if this is a comparison query
    if (
      normalizedQuery.includes("compare") ||
      normalizedQuery.includes("vs") ||
      normalizedQuery.includes("difference")
    ) {
      return [
        {
          id: "sq_1",
          question:
            "What are the key characteristics of the first item being compared?",
          type: "research" as const,
          priority: 1,
          dependencies: [],
          expectedTools: ["tavilySearch"],
          confidence: 0.8,
        },
        {
          id: "sq_2",
          question:
            "What are the key characteristics of the second item being compared?",
          type: "research" as const,
          priority: 2,
          dependencies: ["sq_1"],
          expectedTools: ["tavilySearch"],
          confidence: 0.8,
        },
        {
          id: "sq_3",
          question:
            "What are the main differences and similarities between these items?",
          type: "comparison" as const,
          priority: 3,
          dependencies: ["sq_1", "sq_2"],
          expectedTools: ["tavilySearch", "retrieveRelevantChunks"],
          confidence: 0.8,
        },
      ];
    }

    // Check if this is a synthesis query
    if (
      intent === "SYNTHESIS" ||
      normalizedQuery.includes("synthesize") ||
      normalizedQuery.includes("combine") ||
      normalizedQuery.includes("integrate")
    ) {
      return [
        {
          id: "sq_1",
          question:
            "What are the key components and sources of information for this topic?",
          type: "research" as const,
          priority: 1,
          dependencies: [],
          expectedTools: ["tavilySearch"],
          confidence: 0.8,
        },
        {
          id: "sq_2",
          question:
            "How do these different sources and components relate to each other?",
          type: "analysis" as const,
          priority: 2,
          dependencies: ["sq_1"],
          expectedTools: ["retrieveRelevantChunks"],
          confidence: 0.8,
        },
        {
          id: "sq_3",
          question:
            "What is the integrated understanding and comprehensive view of this topic?",
          type: "synthesis" as const,
          priority: 3,
          dependencies: ["sq_1", "sq_2"],
          expectedTools: ["tavilySearch", "retrieveRelevantChunks"],
          confidence: 0.8,
        },
      ];
    }

    // Generic fallback for other query types
    return [
      {
        id: "sq_1",
        question: `What is the current state of knowledge about ${query}?`,
        type: "research" as const,
        priority: 1,
        dependencies: [],
        expectedTools: ["tavilySearch"],
        confidence: 0.8,
      },
      {
        id: "sq_2",
        question: "What specific details or examples support this information?",
        type: "analysis" as const,
        priority: 2,
        dependencies: ["sq_1"],
        expectedTools: ["retrieveRelevantChunks"],
        confidence: 0.8,
      },
      {
        id: "sq_3",
        question: "How reliable and current are these sources?",
        type: "verification" as const,
        priority: 3,
        dependencies: ["sq_1", "sq_2"],
        expectedTools: ["tavilySearch"],
        confidence: 0.8,
      },
    ];
  }

  private determineExecutionOrder(subQuestions: SubQuestion[]): string[] {
    // Topological sort based on dependencies
    const executionOrder: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (questionId: string) => {
      if (visiting.has(questionId)) {
        throw new Error(`Circular dependency detected: ${questionId}`);
      }
      if (visited.has(questionId)) {
        return;
      }

      visiting.add(questionId);

      const question = subQuestions.find((q) => q.id === questionId);
      if (question) {
        for (const dep of question.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(questionId);
      visited.add(questionId);
      executionOrder.push(questionId);
    };

    // Sort by priority first, then resolve dependencies
    const sortedQuestions = [...subQuestions].sort(
      (a, b) => a.priority - b.priority,
    );

    for (const question of sortedQuestions) {
      if (!visited.has(question.id)) {
        visit(question.id);
      }
    }

    return executionOrder;
  }

  private calculateComplexity(
    subQuestions: SubQuestion[],
  ): "low" | "medium" | "high" | "critical" {
    const totalQuestions = subQuestions.length;
    const avgPriority =
      subQuestions.reduce((sum, q) => sum + q.priority, 0) / totalQuestions;
    const hasVerification = subQuestions.some((q) => q.type === "verification");
    const hasAnalysis = subQuestions.some((q) => q.type === "analysis");

    let complexityScore = 0;
    complexityScore += totalQuestions * 10;
    complexityScore += avgPriority * 5;
    complexityScore += hasVerification ? 20 : 0;
    complexityScore += hasAnalysis ? 15 : 0;

    if (complexityScore <= 30) return "low";
    if (complexityScore <= 60) return "medium";
    if (complexityScore <= 90) return "high";
    return "critical";
  }

  private estimateProcessingTime(
    subQuestions: SubQuestion[],
    complexity: string,
  ): number {
    const baseTimePerQuestion = 5000; // 5 seconds per question
    const complexityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3,
    };

    const totalTime =
      subQuestions.length *
      baseTimePerQuestion *
      complexityMultiplier[complexity as keyof typeof complexityMultiplier];
    return Math.min(totalTime, MAX_MODE_CONFIG.performance.maxProcessingTime);
  }

  private createFallbackDecomposition(query: string): QueryDecomposition {
    return {
      originalQuery: query,
      intent: "RESEARCH",
      subQuestions: [
        {
          id: "sq_1",
          question: query,
          type: "research",
          priority: 1,
          dependencies: [],
          expectedTools: ["tavilySearch"],
          confidence: 0.8,
        },
      ],
      executionOrder: ["sq_1"],
      estimatedComplexity: "medium",
      totalProcessingTime: 10000,
    };
  }
}

export const maxQueryDecomposer = new MaxQueryDecomposer();
