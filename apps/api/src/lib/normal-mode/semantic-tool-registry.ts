//semantic-tool-registry.ts
import { ProductionToolRegistry } from "../tool-registry";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TOOL_CONFIGS, getToolConfig } from "../tool-config";

export interface SemanticToolMetadata {
  name: string;
  category: 'research' | 'analysis' | 'execution' | 'planning';
  keywords: string[];
  priority: number;
  alwaysAvailable: boolean;
  description: string;
  usageExamples: string[];
  semanticContext: string;
}

export class SemanticToolRegistry extends ProductionToolRegistry {
  private embeddings: GoogleGenerativeAIEmbeddings | null = null;
  private toolEmbeddings = new Map<string, number[]>();
  private queryCache = new Map<string, { tools: any[]; confidence: number; timestamp: number }>();
  private toolPerformance = new Map<string, { successCount: number; totalUsage: number; lastUsed: number }>();
  private queryComplexityHistory = new Map<string, { keywordWorked: boolean; semanticNeeded: boolean; usageCount: number }>();
  private initializationPromise: Promise<void> | null = null;

  constructor(tools: any[]) {
    super(tools);
    // ✅ Make initialization synchronous - wait for it to complete
    this.initializationPromise = this.initializeSemanticRegistry();
  }

  // ✅ Add method to ensure initialization is complete
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      try {
        await this.initializationPromise;
        console.log("[DEBUG] ✅ Initialization completed successfully");
      } catch (error) {
        console.error("[ERROR] Initialization failed:", error);
        // Reset the promise so we don't get stuck
        this.initializationPromise = null;
      }
    }
  }

  // ✅ Public method to check if registry is ready
  public isReady(): boolean {
    return this.embeddings !== null && this.toolEmbeddings.size > 0;
  }

  // ✅ Public method to get initialization status
  public getInitializationStatus(): { ready: boolean; embeddingsCount: number; error?: string } {
    return {
      ready: this.isReady(),
      embeddingsCount: this.toolEmbeddings.size,
      error: this.initializationPromise ? undefined : 'Initialization failed or not started'
    };
  }

  private async initializeSemanticRegistry() {
    try {
      console.log("[DEBUG] Initializing semantic embeddings...");
      
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        maxConcurrency: 5,
      });
      
      console.log("[DEBUG] Embeddings model created successfully");
      
      const startTime = Date.now();
      let successCount = 0;
      
      // ✅ Add individual error handling for each tool
      for (const toolConfig of TOOL_CONFIGS) {
        try {
          await this.generateToolEmbedding(toolConfig.name, toolConfig);
          successCount++;
          console.log(`[DEBUG] ✅ Generated embedding for ${toolConfig.name}`);
        } catch (toolError) {
          console.error(`[ERROR] Failed to generate embedding for ${toolConfig.name}:`, toolError);
        }
      }

      console.log(`[DEBUG] Semantic embeddings generated for ${successCount}/${TOOL_CONFIGS.length} tools in ${Date.now() - startTime}ms`);
      console.log(`[DEBUG] Tool embeddings map size: ${this.toolEmbeddings.size}`);
      
      // ✅ Verify embeddings are working
      if (this.toolEmbeddings.size === 0) {
        throw new Error("No tool embeddings were generated");
      }
      
    } catch (error) {
      console.error("[ERROR] Failed to initialize semantic embeddings:", error);
      this.embeddings = null;
      this.toolEmbeddings.clear(); // Clear any partial embeddings
    }
  }

  /**
   * ✅ FIXED: Use ensemble instead of fallback
   */
  async selectToolsSemantically(query: string, agentType?: string, maxTools: number = 3): Promise<{
    tools: any[];
    confidenceScores: number[];
    reasonings: string[];
    selectionMethod: string;
  }> {
    await this.ensureInitialized(); // Ensure initialization is complete
    const startTime = Date.now();
    
    // ✅ Log initialization status
    const status = this.getInitializationStatus();
    console.log(`[DEBUG] Registry status: ready=${status.ready}, embeddings=${status.embeddingsCount}, error=${status.error || 'none'}`);
    
    // Check cache first
    const cacheKey = this.hashQuery(query);
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
      return {
        tools: cached.tools,
        confidenceScores: [cached.confidence],
        reasonings: ['Cached semantic result'],
        selectionMethod: 'cached_semantic'
      };
    }

    // ✅ Get BOTH semantic and keyword predictions
    const [semanticPredictions, keywordPredictions] = await Promise.all([
      this.getSemanticPredictions(query, maxTools),
      this.getKeywordPredictions(query, maxTools)
    ]);

    console.log(`[DEBUG] Semantic predictions:`, semanticPredictions.map(p => `${p.toolName}: ${(p.confidence * 100).toFixed(1)}%`));
    console.log(`[DEBUG] Keyword predictions:`, keywordPredictions.map(p => `${p.toolName}: ${(p.confidence * 100).toFixed(1)}%`));

    // ✅ Ensemble voting: combine both approaches
    const ensembleResult = this.ensembleVoting(semanticPredictions, keywordPredictions, maxTools);
    
    console.log(`[DEBUG] Ensemble result:`, ensembleResult.tools.map(t => t.name));
    
    return ensembleResult;
  }

  /**
   * ✅ Get semantic predictions (existing logic)
   */
  private async getSemanticPredictions(query: string, maxTools: number) {
    await this.ensureInitialized(); // Ensure initialization is complete
    console.log(`[DEBUG] getSemanticPredictions called with query: "${query}"`);
    console.log(`[DEBUG] this.embeddings exists: ${!!this.embeddings}`);
    console.log(`[DEBUG] this.toolEmbeddings size: ${this.toolEmbeddings.size}`);
    
    if (!this.embeddings) {
      console.log("[DEBUG] No embeddings model available");
      return [];
    }

    try {
      const semanticResult = await this.semanticSelection(query, maxTools);
      console.log(`[DEBUG] Semantic selection returned:`, semanticResult);
      return semanticResult.tools.map((tool, i) => ({
        toolName: tool.name,
        tool: tool,
        confidence: semanticResult.confidenceScores[i] || 0.5,
        method: 'semantic'
      }));
    } catch (error) {
      console.error("[ERROR] Semantic predictions failed:", error);
      return [];
    }
  }

  // ✅ Dynamic keyword predictions from config
  private async getKeywordPredictions(query: string, maxTools: number) {
    await this.ensureInitialized(); // Ensure initialization is complete
    const queryLower = query.toLowerCase();
    const predictions: Array<{
      toolName: string;
      tool: any;
      confidence: number;
      method: string;
    }> = [];

    // ✅ Check for document-specific queries first (high priority)
    if (queryLower.includes('@') || queryLower.match(/[a-f0-9-]{36}/)) {
      const tool = this.getAllTools().find(t => t.name === 'retrieveRelevantChunks');
      if (tool) {
        predictions.push({
          toolName: 'retrieveRelevantChunks',
          tool,
          confidence: 0.95, // Very high confidence for document mentions
          method: 'document_mention'
        });
      }
    }

    // ✅ Enhanced document query detection
    const documentKeywords = ['position', 'role', 'job', 'title', 'work', 'company', 'organization', 'employer', 'employee', 'staff', 'member', 'team', 'department'];
    const hasDocumentKeywords = documentKeywords.some(keyword => queryLower.includes(keyword));
    
    if (hasDocumentKeywords) {
      const tool = this.getAllTools().find(t => t.name === 'retrieveRelevantChunks');
      if (tool) {
        predictions.push({
          toolName: 'retrieveRelevantChunks',
          tool,
          confidence: 0.85, // High confidence for position/role queries
          method: 'document_keywords'
        });
      }
    }

    // ✅ Use config triggers instead of hardcoded patterns
    for (const toolConfig of TOOL_CONFIGS) {
      const matchCount = toolConfig.triggers.filter(trigger => 
        queryLower.includes(trigger.toLowerCase())
      ).length;

      if (matchCount > 0) {
        const tool = this.getAllTools().find(t => t.name === toolConfig.name);
        if (tool) {
          // Higher confidence for more trigger matches
          const confidence = Math.min(0.95, 0.7 + (matchCount * 0.1));
          
          // Don't add if already added for document mention
          if (!(toolConfig.name === 'retrieveRelevantChunks' && (queryLower.includes('@') || hasDocumentKeywords))) {
            predictions.push({
              toolName: toolConfig.name,
              tool,
              confidence,
              method: 'keyword'
            });
          }
        }
      }
    }

    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxTools);
  }

  /**
   * ✅ IMPROVED: Dynamic weighting based on prediction availability and score distribution
   */
  private ensembleVoting(semanticPredictions: any[], keywordPredictions: any[], maxTools: number) {
    const toolScores = new Map<string, { score: number, tool: any, methods: string[] }>();
    
    // ✅ Dynamic weighting based on prediction availability
    let keywordWeight = 0.7;
    let semanticWeight = 0.3;
    
    // ✅ If no keyword predictions, increase semantic weight
    if (keywordPredictions.length === 0) {
      console.log(`[DEBUG] No keyword predictions found, increasing semantic weight`);
      keywordWeight = 0.2;
      semanticWeight = 0.8; // Give semantic more influence when keywords fail
    }
    
    // ✅ If semantic predictions are all very close, rely more on keywords
    if (semanticPredictions.length > 1) {
      const semanticScores = semanticPredictions.map(p => p.confidence).sort((a, b) => b - a);
      const topTwo = semanticScores.slice(0, 2);
      if (topTwo.length === 2 && topTwo[0] - topTwo[1] < 0.05) { // Very close scores
        console.log(`[DEBUG] Semantic scores very close, relying more on keywords`);
        keywordWeight = 0.85;
        semanticWeight = 0.15;
      }
    }
    
    console.log(`[DEBUG] Using weights: keyword=${(keywordWeight*100).toFixed(0)}%, semantic=${(semanticWeight*100).toFixed(0)}%`);
    
    // Keyword vote with dynamic weight
    keywordPredictions.forEach(pred => {
      const current = toolScores.get(pred.toolName) || { score: 0, tool: pred.tool, methods: [] };
      current.score += pred.confidence * keywordWeight;
      current.methods.push('keyword');
      toolScores.set(pred.toolName, current);
    });
    
    // Semantic vote with dynamic weight
    semanticPredictions.forEach(pred => {
      const current = toolScores.get(pred.toolName) || { score: 0, tool: pred.tool, methods: [] };
      current.score += pred.confidence * semanticWeight;
      current.methods.push('semantic');
      toolScores.set(pred.toolName, current);
    });

    const sortedTools = Array.from(toolScores.entries())
      .sort(([,a], [,b]) => b.score - a.score);

    if (sortedTools.length === 0) {
      return { tools: [], confidenceScores: [], reasonings: [], selectionMethod: 'no_tools' };
    }

    // ✅ Dynamic threshold: at least 50% of top score
    const topScore = sortedTools[0][1].score;
    const adaptiveThreshold = Math.max(0.3, topScore * 0.5); // At least 50% of top score
    
    console.log(`[DEBUG] Adaptive threshold: ${(adaptiveThreshold * 100).toFixed(1)}% (based on top: ${(topScore * 100).toFixed(1)}%)`);

    const rankedTools = sortedTools
      .filter(([,data]) => data.score >= adaptiveThreshold)
      .slice(0, maxTools);

    // ✅ Always include at least the top tool
    if (rankedTools.length === 0) {
      rankedTools.push(sortedTools[0]);
    }

    const tools = rankedTools.map(([,data]) => data.tool);
    const confidenceScores = rankedTools.map(([,data]) => data.score);
    const reasonings = rankedTools.map(([toolName, data]) => 
      `${toolName}: ${(data.score * 100).toFixed(1)}% (${data.methods.join(' + ')})`
    );

    return {
      tools,
      confidenceScores,
      reasonings,
      selectionMethod: 'ensemble_voting_dynamic'
    };
  }

  /**
   * Enhanced keyword selection that handles compound queries better
   */
  private async enhancedKeywordSelection(query: string, maxTools: number) {
    await this.ensureInitialized(); // Ensure initialization is complete
    const queryLower = query.toLowerCase();
    const scores = new Map<string, number>();
    
    // Check for time-related queries
    if (queryLower.includes('time') || queryLower.includes('moment') || 
        queryLower.includes('clock') || queryLower.includes('hour') || 
        queryLower.includes('minute') || queryLower.includes('date')) {
      scores.set('getCurrentDateTime', 100); // High priority for time
    }
    
    // Check for news/search queries
    if (queryLower.includes('news') || queryLower.includes('breaking') || 
        queryLower.includes('latest') || queryLower.includes('current') || 
        queryLower.includes('search') || queryLower.includes('find')) {
      scores.set('tavilySearch', 90); // High priority for search
    }
    
    // Check for document queries
    if (queryLower.includes('document') || queryLower.includes('uploaded') || 
        queryLower.includes('@') || queryLower.includes('resume') || 
        queryLower.includes('contract')) {
      scores.set('retrieveRelevantChunks', 85); // High priority for documents
    }
    
    // Check for weather queries
    if (queryLower.includes('weather') || queryLower.includes('temperature') || 
        queryLower.includes('forecast') || queryLower.includes('rain')) {
      scores.set('getCurrentWeather', 80); // High priority for weather
    }

    // Return tools sorted by score
    return Array.from(scores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxTools)
      .map(([toolName]) => this.getAllTools().find(t => t.name === toolName))
      .filter(Boolean);
  }

  /**
   * True semantic selection using embeddings
   */
  private async semanticSelection(query: string, maxTools: number) {
    await this.ensureInitialized(); // Ensure initialization is complete
    console.log(`[DEBUG] semanticSelection called with query: "${query}"`);
    console.log(`[DEBUG] this.embeddings exists: ${!!this.embeddings}`);
    console.log(`[DEBUG] this.toolEmbeddings size: ${this.toolEmbeddings.size}`);
    
    if (!this.embeddings) {
      console.log("[DEBUG] No embeddings model available in semanticSelection");
      return { tools: [], confidenceScores: [], reasonings: [], selectionMethod: 'no_semantic_model' };
    }

    try {
      // Generate query embedding
      console.log("[DEBUG] Generating query embedding...");
      const queryEmbedding = await this.embeddings.embedQuery(query);
      console.log(`[DEBUG] Query embedding generated, length: ${queryEmbedding.length}`);
      
      // Calculate semantic similarity with all tools
      const similarities: Array<{
        toolName: string;
        similarity: number;
        tool: any;
      }> = [];

      console.log(`[DEBUG] Calculating similarities with ${this.toolEmbeddings.size} tool embeddings...`);
      
      for (const [toolName, toolEmbedding] of this.toolEmbeddings) {
        console.log(`[DEBUG] Processing tool: ${toolName}`);
        const similarity = this.cosineSimilarity(queryEmbedding, toolEmbedding);
        console.log(`[DEBUG] ${toolName} similarity: ${(similarity * 100).toFixed(1)}%`);
        
        const tool = this.getAllTools().find(t => t.name === toolName);
        
        if (tool) {
          similarities.push({
            toolName,
            similarity,
            tool
          });
        } else {
          console.log(`[WARNING] Tool ${toolName} not found in getAllTools()`);
        }
      }

      console.log(`[DEBUG] Found ${similarities.length} tools with similarities`);

      // Sort by semantic similarity + performance boost
      similarities.sort((a, b) => {
        const aPerf = this.toolPerformance.get(a.toolName);
        const bPerf = this.toolPerformance.get(b.toolName);
        
        // Boost score based on past performance
        const aScore = a.similarity + (aPerf ? (aPerf.successCount / Math.max(aPerf.totalUsage, 1)) * 0.1 : 0);
        const bScore = b.similarity + (bPerf ? (bPerf.successCount / Math.max(bPerf.totalUsage, 1)) * 0.1 : 0);
        
        return bScore - aScore;
      });

      // Select top tools with high confidence
      const selectedTools = similarities
        .filter(item => item.similarity > 0.3) // Confidence threshold
        .slice(0, maxTools);

      console.log(`[DEBUG] Selected tools after confidence filter (>0.3): ${selectedTools.length}`);
      selectedTools.forEach(tool => {
        console.log(`[DEBUG] Selected: ${tool.toolName} (similarity: ${(tool.similarity * 100).toFixed(1)}%)`);
      });

      const tools = selectedTools.map(item => item.tool);
      const confidenceScores = selectedTools.map(item => item.similarity);
      const reasonings = selectedTools.map(item => 
        `Semantic similarity: ${(item.similarity * 100).toFixed(1)}%`
      );

      // Cache the result
      if (tools.length > 0) {
        this.queryCache.set(this.hashQuery(query), {
          tools,
          confidence: Math.max(...confidenceScores),
          timestamp: Date.now()
        });
      }

      return {
        tools,
        confidenceScores,
        reasonings,
        selectionMethod: 'semantic_similarity'
      };
    } catch (error) {
      console.error("[ERROR] Error in semanticSelection:", error);
      return { tools: [], confidenceScores: [], reasonings: [], selectionMethod: 'error' };
    }
  }

  /**
   * LEARNING: Record tool performance for future improvement
   */
  async recordToolUsage(toolName: string, query: string, success: boolean, userFeedback?: number) {
    await this.ensureInitialized(); // Ensure initialization is complete
    const current = this.toolPerformance.get(toolName) || {
      successCount: 0,
      totalUsage: 0,
      lastUsed: Date.now()
    };

    current.totalUsage++;
    if (success) current.successCount++;
    current.lastUsed = Date.now();

    // Update performance metrics
    if (success) {
      current.successCount++;
    }

    this.toolPerformance.set(toolName, current);
  }

  // ✅ Updated embedding generation using config
  private async generateToolEmbedding(toolName: string, toolConfig: any) {
    console.log(`[DEBUG] generateToolEmbedding called for ${toolName}`);
    
    if (!this.embeddings) {
      console.log(`[ERROR] No embeddings model available for ${toolName}`);
      return;
    }
    
    try {
      const embeddingText = `
        Tool: ${toolConfig.name}
        Description: ${toolConfig.description}
        Category: ${toolConfig.category}
        Context: ${toolConfig.semanticContext}
        Example uses: ${toolConfig.usageExamples.join('. ')}
      `.trim();

      console.log(`[DEBUG] Generating embedding for ${toolName} with text length: ${embeddingText.length}`);
      
      const embedding = await this.embeddings.embedQuery(embeddingText);
      console.log(`[DEBUG] ✅ Generated embedding for ${toolName}, length: ${embedding.length}`);
      
      this.toolEmbeddings.set(toolName, embedding);
      console.log(`[DEBUG] ✅ Stored embedding for ${toolName} in toolEmbeddings map`);
      
    } catch (error) {
      console.error(`[ERROR] Failed to generate embedding for ${toolName}:`, error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  /**
   * Cosine similarity for semantic matching
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private hashQuery(query: string): string {
    return query.toLowerCase().replace(/[^\w]/g, '').substring(0, 50);
  }

  /**
   * Get performance statistics
   */
  getToolPerformance(toolName: string) {
    return this.toolPerformance.get(toolName);
  }

  /**
   * Get all performance data
   */
  getAllPerformanceData() {
    return Object.fromEntries(this.toolPerformance);
  }

  // ✅ Helper method to get tool config
  getToolConfig(toolName: string) {
    return getToolConfig(toolName);
  }
}
