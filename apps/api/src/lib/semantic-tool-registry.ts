//semantic-tool-registry.ts
import { ProductionToolRegistry } from "./tool-registry";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TOOL_CONFIGS, getToolConfig } from "./tool-config";

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

  constructor(tools: any[]) {
    super(tools);
    this.initializeSemanticRegistry();
  }

  private async initializeSemanticRegistry() {
    try {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        maxConcurrency: 5,
      });
      
      const startTime = Date.now();
      
      // ✅ Use centralized config instead of hardcoded metadata
      for (const toolConfig of TOOL_CONFIGS) {
        await this.generateToolEmbedding(toolConfig.name, toolConfig);
      }

      console.log(`[DEBUG] Semantic embeddings generated for ${TOOL_CONFIGS.length} tools in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.warn("[WARNING] Failed to initialize semantic embeddings, falling back to keyword-only selection:", error);
      this.embeddings = null;
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
    const startTime = Date.now();
    
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
    if (!this.embeddings) return [];

    try {
      const semanticResult = await this.semanticSelection(query, maxTools);
      return semanticResult.tools.map((tool, i) => ({
        toolName: tool.name,
        tool: tool,
        confidence: semanticResult.confidenceScores[i] || 0.5,
        method: 'semantic'
      }));
    } catch (error) {
      console.log("[DEBUG] Semantic predictions failed:", error);
      return [];
    }
  }

  // ✅ Dynamic keyword predictions from config
  private async getKeywordPredictions(query: string, maxTools: number) {
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
          if (!(toolConfig.name === 'retrieveRelevantChunks' && queryLower.includes('@'))) {
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
  private enhancedKeywordSelection(query: string, maxTools: number) {
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
    if (!this.embeddings) return { tools: [], confidenceScores: [], reasonings: [], selectionMethod: 'no_semantic_model' };

    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    // Calculate semantic similarity with all tools
    const similarities: Array<{
      toolName: string;
      similarity: number;
      tool: any;
    }> = [];

    for (const [toolName, toolEmbedding] of this.toolEmbeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, toolEmbedding);
      const tool = this.getAllTools().find(t => t.name === toolName);
      
      if (tool) {
        similarities.push({
          toolName,
          similarity,
          tool
        });
      }
    }

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
  }

  /**
   * LEARNING: Record tool performance for future improvement
   */
  async recordToolUsage(toolName: string, query: string, success: boolean, userFeedback?: number) {
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
    if (!this.embeddings) return;
    
    const embeddingText = `
      Tool: ${toolConfig.name}
      Description: ${toolConfig.description}
      Category: ${toolConfig.category}
      Context: ${toolConfig.semanticContext}
      Example uses: ${toolConfig.usageExamples.join('. ')}
    `.trim();

    const embedding = await this.embeddings.embedQuery(embeddingText);
    this.toolEmbeddings.set(toolName, embedding);
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
