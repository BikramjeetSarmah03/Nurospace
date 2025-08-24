// tool-registry.ts
interface ToolMetadata {
    name: string;
    category: 'research' | 'analysis' | 'execution' | 'planning';
    keywords: string[];
    priority: number;
    alwaysAvailable: boolean;
    description?: string;
  inputFormat?: string;
  outputFormat?: string;
  dependencies?: string[];
  tags?: string[];
  }
  
  export class ProductionToolRegistry {
    private toolMap = new Map<string, any>();
    private metadata = new Map<string, ToolMetadata>();
  private categoryIndex = new Map<string, Set<string>>();
  private keywordIndex = new Map<string, Set<string>>();
  private priorityQueue = new Map<number, Set<string>>();
  private cache = new Map<string, any[]>();
  private cacheTimestamp = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
    constructor(toolset: any[]) {
      this.initializeRegistry(toolset);
    }
  
    private initializeRegistry(toolset: any[]) {
      const startTime = Date.now();
      
    // Define comprehensive tool metadata
      const toolMetadata: ToolMetadata[] = [
        {
        name: 'retrieveRelevantChunks',
          category: 'research',
        keywords: ['document', 'pdf', 'file', 'analyze', '@', 'search', 'find', 'content', 'text'],
          priority: 10,
          alwaysAvailable: true,
        description: 'Search and analyze uploaded documents and files',
        inputFormat: 'text with @document_id or natural language',
        outputFormat: 'relevant document content',
        tags: ['document', 'search', 'analysis']
        },
        {
          name: 'tavilySearch',
          category: 'research', 
        keywords: ['search', 'web', 'internet', 'news', 'find', 'latest', 'current', 'recent', 'information'],
          priority: 9,
          alwaysAvailable: true,
        description: 'Search the internet for current information and news',
        inputFormat: 'search query',
        outputFormat: 'search results with sources',
        tags: ['web', 'search', 'news']
        },
        {
          name: 'getCurrentDateTime',
          category: 'analysis',
        keywords: ['time', 'date', 'today', 'now', 'current', 'what time', 'what day', 'clock'],
          priority: 8,
          alwaysAvailable: true,
        description: 'Get current date and time information',
        inputFormat: 'any text (ignored)',
        outputFormat: 'formatted date and time',
        tags: ['time', 'date', 'utility']
        },
        {
          name: 'getCurrentWeather',
          category: 'execution',
        keywords: ['weather', 'temperature', 'forecast', 'climate', 'rain', 'sunny', 'hot', 'cold'],
          priority: 7,
          alwaysAvailable: true,
        description: 'Get weather information for any location',
        inputFormat: 'city name or location',
        outputFormat: 'weather data with temperature and conditions',
        tags: ['weather', 'api', 'location']
        }
      ];
  
    // Register all tools with metadata
      for (const tool of toolset) {
      this.addTool(tool, toolMetadata.find(m => m.name === tool.name));
    }

    // Build indexes for fast lookup
    this.buildIndexes();

    const initTime = Date.now() - startTime;
    console.log(`[DEBUG] Production Tool Registry initialized with ${this.toolMap.size} tools in ${initTime}ms`);
  }

  /**
   * Add a new tool to the registry with metadata
   */
  addTool(tool: any, metadata?: ToolMetadata): void {
        this.toolMap.set(tool.name, tool);
        
    if (metadata) {
      this.metadata.set(tool.name, metadata);
        } else {
      // Auto-generate metadata if not provided
      this.metadata.set(tool.name, this.generateMetadata(tool));
    }
    
    this.invalidateCache();
    this.buildIndexes();
  }

  /**
   * Remove a tool from the registry
   */
  removeTool(toolName: string): boolean {
    const removed = this.toolMap.delete(toolName);
    if (removed) {
      this.metadata.delete(toolName);
      this.invalidateCache();
      this.buildIndexes();
    }
    return removed;
  }

  /**
   * Update tool metadata
   */
  updateToolMetadata(toolName: string, metadata: Partial<ToolMetadata>): boolean {
    const existing = this.metadata.get(toolName);
    if (existing) {
      this.metadata.set(toolName, { ...existing, ...metadata });
      this.invalidateCache();
      this.buildIndexes();
      return true;
    }
    return false;
  }

  /**
   * Smart tool selection based on query analysis
   */
  selectToolsForQuery(query: string, agentType?: string): any[] {
    const cacheKey = `${query.toLowerCase()}_${agentType || 'any'}`;
    
    // Check cache first
    if (this.isCacheValid() && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const queryLower = query.toLowerCase();
    const selectedTools: any[] = [];
    const toolScores = new Map<string, number>();

    // Score each tool based on query relevance
    for (const [toolName, metadata] of this.metadata) {
      let score = 0;

      // Category matching
      if (agentType && metadata.category === agentType) {
        score += 50;
      }

      // Keyword matching
      for (const keyword of metadata.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Priority boost
      score += metadata.priority;

      // Always available tools get a small boost
      if (metadata.alwaysAvailable) {
        score += 5;
      }

      if (score > 0) {
        toolScores.set(toolName, score);
      }
    }

    // Sort by score and select top tools
    const sortedTools = Array.from(toolScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Limit to top 3 tools

    for (const [toolName] of sortedTools) {
      const tool = this.toolMap.get(toolName);
      if (tool) {
        selectedTools.push(tool);
      }
    }

    // Cache the result
    this.cache.set(cacheKey, selectedTools);
    this.cacheTimestamp = Date.now();

    return selectedTools;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): any[] {
    const toolNames = this.categoryIndex.get(category);
    if (!toolNames) return [];
    
    return Array.from(toolNames)
      .map(name => this.toolMap.get(name))
      .filter(Boolean);
  }

  /**
   * Get tools by keyword
   */
  getToolsByKeyword(keyword: string): any[] {
    const toolNames = this.keywordIndex.get(keyword.toLowerCase());
    if (!toolNames) return [];
    
    return Array.from(toolNames)
      .map(name => this.toolMap.get(name))
      .filter(Boolean);
  }

  /**
   * Get tools by priority level
   */
  getToolsByPriority(minPriority: number): any[] {
    const selectedTools: any[] = [];
    
    for (const [priority, toolNames] of this.priorityQueue) {
      if (priority >= minPriority) {
        for (const toolName of toolNames) {
          const tool = this.toolMap.get(toolName);
          if (tool) {
            selectedTools.push(tool);
          }
        }
      }
    }
    
    return selectedTools;
  }

  /**
   * Get all available tools
   */
    getAllTools(): any[] {
      return Array.from(this.toolMap.values());
    }
  
  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string): ToolMetadata | undefined {
    return this.metadata.get(toolName);
  }

  /**
   * Get all tool names
   */
  getToolNames(): string[] {
      return Array.from(this.toolMap.keys());
    }
  
  /**
   * Get tool count
   */
    getToolCount(): number {
      return this.toolMap.size;
    }
  
  /**
   * Validate tool registry integrity
   */
  validateRegistry(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for missing metadata
    for (const [toolName] of this.toolMap) {
      if (!this.metadata.has(toolName)) {
        errors.push(`Missing metadata for tool: ${toolName}`);
      }
    }
    
    // Check for orphaned metadata
    for (const [toolName] of this.metadata) {
      if (!this.toolMap.has(toolName)) {
        errors.push(`Orphaned metadata for non-existent tool: ${toolName}`);
      }
    }
    
    // Check for essential tools
    const essentialTools = ['getCurrentDateTime', 'getCurrentWeather', 'tavilySearch'];
    for (const toolName of essentialTools) {
      if (!this.toolMap.has(toolName)) {
        errors.push(`Missing essential tool: ${toolName}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate system message with tool capabilities
   */
  generateSystemMessage(): string {
    const toolCount = this.toolMap.size;
    const categories = new Set(Array.from(this.metadata.values()).map(m => m.category));
    
    let message = `You are an intelligent AI assistant with ${toolCount} specialized tools across ${categories.size} categories.\n\n`;
    
    // Add category descriptions
    for (const category of categories) {
      const categoryTools = this.getToolsByCategory(category);
      const toolNames = categoryTools.map(t => t.name).join(', ');
      message += `**${category.toUpperCase()}**: ${toolNames}\n`;
    }
    
    message += `\nI automatically select the most relevant tools based on your request. Just ask naturally!`;
    
    return message;
  }

  /**
   * Private helper methods
   */
  private generateMetadata(tool: any): ToolMetadata {
    const name = tool.name.toLowerCase();
    const description = (tool.description || '').toLowerCase();
    
    // Auto-detect category
    let category: 'research' | 'analysis' | 'execution' | 'planning' = 'planning';
    if (name.includes('search') || name.includes('find') || description.includes('search')) {
      category = 'research';
    } else if (name.includes('calculate') || name.includes('analyze') || description.includes('analysis')) {
      category = 'analysis';
    } else if (name.includes('execute') || name.includes('perform') || description.includes('action')) {
      category = 'execution';
    }
    
    // Auto-generate keywords
    const keywords = [name, ...name.split(/(?=[A-Z])|_|-/).map((k: string) => k.toLowerCase())];
    
    return {
      name: tool.name,
      category,
      keywords,
      priority: 5,
      alwaysAvailable: false,
      description: tool.description || 'Auto-generated tool'
    };
  }

  private buildIndexes(): void {
    // Clear existing indexes
    this.categoryIndex.clear();
    this.keywordIndex.clear();
    this.priorityQueue.clear();
    
    // Build category index
    for (const [toolName, metadata] of this.metadata) {
      if (!this.categoryIndex.has(metadata.category)) {
        this.categoryIndex.set(metadata.category, new Set());
      }
      this.categoryIndex.get(metadata.category)!.add(toolName);
    }
    
    // Build keyword index
    for (const [toolName, metadata] of this.metadata) {
      for (const keyword of metadata.keywords) {
        const key = keyword.toLowerCase();
        if (!this.keywordIndex.has(key)) {
          this.keywordIndex.set(key, new Set());
        }
        this.keywordIndex.get(key)!.add(toolName);
      }
    }
    
    // Build priority queue
    for (const [toolName, metadata] of this.metadata) {
      if (!this.priorityQueue.has(metadata.priority)) {
        this.priorityQueue.set(metadata.priority, new Set());
      }
      this.priorityQueue.get(metadata.priority)!.add(toolName);
    }
  }

  private invalidateCache(): void {
    this.cache.clear();
    this.cacheTimestamp = 0;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
    }
  }
  