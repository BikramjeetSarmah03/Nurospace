import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ProductionToolRegistry } from "./tool-registry";

interface SemanticToolMetadata {
  name: string;
  category: 'research' | 'analysis' | 'execution' | 'planning';
  keywords: string[];
  priority: number;
  alwaysAvailable: boolean;
  description: string;
  usageExamples: string[]; // Key addition for semantic understanding
  semanticContext: string; // Rich context for embeddings
  inputFormat?: string;
  outputFormat?: string;
  dependencies?: string[];
  tags?: string[];
}

export class SemanticToolRegistry extends ProductionToolRegistry {
  private embeddings: GoogleGenerativeAIEmbeddings;
  
  // Vector embeddings for true semantic matching
  private toolEmbeddings = new Map<string, number[]>();
  private queryCache = new Map<string, { tools: any[], confidence: number, timestamp: number }>();
  
  // Learning system
  private toolPerformance = new Map<string, {
    successCount: number;
    totalUsage: number;
    avgRelevanceScore: number;
    lastUsed: number;
  }>();

  constructor(toolset: any[]) {
    super(toolset);
    
    // Initialize embeddings (fallback to null if no API key)
    try {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "embedding-001", // Google's embedding model
      });
      this.initializeSemanticRegistry();
    } catch (error) {
      console.log("[DEBUG] Google API key not found, using keyword-based selection only");
      this.embeddings = null as any;
    }
  }

  private async initializeSemanticRegistry() {
    if (!this.embeddings) return;
    
    const startTime = Date.now();
    
    // Rich semantic metadata for your existing tools
    const semanticMetadata: SemanticToolMetadata[] = [
      {
        name: 'retrieveRelevantChunks',
        category: 'research',
        keywords: ['document', 'pdf', 'file', '@'],
        priority: 10,
        alwaysAvailable: true,
        description: 'Search and analyze uploaded documents and personal files',
        usageExamples: [
          'analyze my resume',
          'what does the contract say about payments',
          'find information in my uploaded document',
          'search through my personal files',
          '@doc123 what are the key points'
        ],
        semanticContext: 'document analysis, file search, personal information retrieval, content analysis, uploaded documents, PDF processing, text extraction'
      },
      {
        name: 'tavilySearch',
        category: 'research',
        keywords: ['search', 'web', 'internet', 'news', 'latest', 'breaking', 'current', 'recent'],
        priority: 9,
        alwaysAvailable: true,
        description: 'Search the internet for current information, news, breaking news, and real-time data',
        usageExamples: [
          'what is the latest news about AI',
          'current stock price of Apple',
          'recent developments in climate change',
          'breaking news today',
          'latest updates on climate change',
          'current events happening now',
          'find current information about cryptocurrency'
        ],
        semanticContext: 'web search, internet information, current events, news, breaking news, real-time data, external knowledge, public information, recent updates, latest information, current happenings, breaking developments'
      },
      {
        name: 'getCurrentDateTime',
        category: 'analysis',
        keywords: ['time', 'date', 'now', 'current', 'moment', 'clock', 'hour', 'minute'],
        priority: 8,
        alwaysAvailable: true,
        description: 'Get current date and time information, time queries, clock information',
        usageExamples: [
          'what time is it',
          'what day is today',
          'current date and time',
          'what is the current timestamp',
          'tell me today\'s date',
          'whats the time right now',
          'current moment',
          'time and date'
        ],
        semanticContext: 'current time, present moment, today\'s date, clock, calendar, timestamp, now, present time, time queries, moment queries, clock queries, time information, date information, current time queries'
      },
      {
        name: 'getCurrentWeather',
        category: 'execution',
        keywords: ['weather', 'temperature', 'forecast'],
        priority: 7,
        alwaysAvailable: true,
        description: 'Get weather information and forecasts for any location',
        usageExamples: [
          'weather in New York',
          'temperature in London today',
          'is it going to rain tomorrow',
          'current weather conditions',
          'forecast for this weekend'
        ],
        semanticContext: 'weather conditions, temperature, precipitation, forecast, climate, atmospheric conditions, meteorology'
      }
    ];

    // Generate embeddings for each tool
    for (const metadata of semanticMetadata) {
      await this.generateToolEmbedding(metadata.name, metadata);
    }

    console.log(`[DEBUG] Semantic embeddings generated in ${Date.now() - startTime}ms`);
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

  /**
   * ✅ Get keyword predictions (your existing enhanced logic)
   */
  private async getKeywordPredictions(query: string, maxTools: number) {
    const queryLower = query.toLowerCase();
    const predictions: Array<{
      toolName: string;
      tool: any;
      confidence: number;
      method: string;
    }> = [];
    
    // Your existing enhanced keyword logic
    if (queryLower.includes('time') || queryLower.includes('moment') || 
        queryLower.includes('clock') || queryLower.includes('hour') || 
        queryLower.includes('minute') || queryLower.includes('date')) {
      predictions.push({
        toolName: 'getCurrentDateTime',
        tool: this.getAllTools().find(t => t.name === 'getCurrentDateTime'),
        confidence: 0.95, // High confidence for clear keyword matches
        method: 'keyword'
      });
    }
    
    if (queryLower.includes('news') || queryLower.includes('breaking') || 
        queryLower.includes('latest') || queryLower.includes('current') || 
        queryLower.includes('search') || queryLower.includes('find')) {
      predictions.push({
        toolName: 'tavilySearch',
        tool: this.getAllTools().find(t => t.name === 'tavilySearch'),
        confidence: 0.9,
        method: 'keyword'
      });
    }
    
    if (queryLower.includes('document') || queryLower.includes('uploaded') || 
        queryLower.includes('@') || queryLower.includes('resume') || 
        queryLower.includes('contract')) {
      predictions.push({
        toolName: 'retrieveRelevantChunks',
        tool: this.getAllTools().find(t => t.name === 'retrieveRelevantChunks'),
        confidence: 0.9,
        method: 'keyword'
      });
    }
    
    if (queryLower.includes('weather') || queryLower.includes('temperature') || 
        queryLower.includes('forecast') || queryLower.includes('rain')) {
      predictions.push({
        toolName: 'getCurrentWeather',
        tool: this.getAllTools().find(t => t.name === 'getCurrentWeather'),
        confidence: 0.9,
        method: 'keyword'
      });
    }

    return predictions.filter(p => p.tool).slice(0, maxTools);
  }

  /**
   * ✅ Ensemble voting: combine semantic + keyword
   */
  private ensembleVoting(semanticPredictions: any[], keywordPredictions: any[], maxTools: number) {
    const toolScores = new Map<string, { score: number, tool: any, methods: string[] }>();
    
    // Keyword vote (weight: 0.7 - higher because more reliable for compound queries)
    keywordPredictions.forEach(pred => {
      const current = toolScores.get(pred.toolName) || { score: 0, tool: pred.tool, methods: [] };
      current.score += pred.confidence * 0.7;
      current.methods.push('keyword');
      toolScores.set(pred.toolName, current);
    });
    
    // Semantic vote (weight: 0.3)
    semanticPredictions.forEach(pred => {
      const current = toolScores.get(pred.toolName) || { score: 0, tool: pred.tool, methods: [] };
      current.score += pred.confidence * 0.3;
      current.methods.push('semantic');
      toolScores.set(pred.toolName, current);
    });

    // Sort by ensemble score
    const rankedTools = Array.from(toolScores.entries())
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, maxTools);

    const tools = rankedTools.map(([,data]) => data.tool);
    const confidenceScores = rankedTools.map(([,data]) => data.score);
    const reasonings = rankedTools.map(([toolName, data]) => 
      `${toolName}: ${(data.score * 100).toFixed(1)}% (${data.methods.join(' + ')})`
    );

    return {
      tools,
      confidenceScores,
      reasonings,
      selectionMethod: 'ensemble_voting'
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
      const aScore = a.similarity + (aPerf ? aPerf.avgRelevanceScore * 0.1 : 0);
      const bScore = b.similarity + (bPerf ? bPerf.avgRelevanceScore * 0.1 : 0);
      
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
      avgRelevanceScore: 0.5,
      lastUsed: Date.now()
    };

    current.totalUsage++;
    if (success) current.successCount++;
    current.lastUsed = Date.now();

    // Update relevance score based on success and feedback
    if (userFeedback !== undefined) {
      current.avgRelevanceScore = (current.avgRelevanceScore + userFeedback) / 2;
    } else {
      current.avgRelevanceScore = (current.avgRelevanceScore + (success ? 1 : 0)) / 2;
    }

    this.toolPerformance.set(toolName, current);
  }

  /**
   * Generate rich embedding for each tool
   */
  private async generateToolEmbedding(toolName: string, metadata: SemanticToolMetadata) {
    // Create rich text for embedding
    const embeddingText = `
      Tool: ${metadata.name}
      Description: ${metadata.description}
      Category: ${metadata.category}
      Context: ${metadata.semanticContext}
      Example uses: ${metadata.usageExamples.join('. ')}
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
}
