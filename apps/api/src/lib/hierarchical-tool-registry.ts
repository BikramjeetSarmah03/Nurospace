// ✅ HIERARCHICAL TOOL REGISTRY - Using Centralized Configuration
import { TOOL_CONFIGS, TOOL_CATEGORIES, getToolConfig } from './tool-config';
import { SemanticToolRegistry } from './semantic-tool-registry';

export class HierarchicalToolRegistry extends SemanticToolRegistry {
  
  async selectToolsHierarchically(query: string, maxTools: number = 3) {
    const startTime = Date.now();
    
    // ✅ Step 1: Select relevant categories using config
    const relevantCategories = await this.selectCategoriesFromConfig(query, 3);
    console.log(`[DEBUG] Selected categories:`, relevantCategories);
    
    // ✅ Step 2: Get candidate tools from selected categories
    const candidateTools = this.getToolsFromCategories(relevantCategories);
    console.log(`[DEBUG] Candidate tools (${candidateTools.length}):`, candidateTools.map(t => t.name));
    
    // ✅ Step 3: Apply semantic selection to candidates only
    const finalSelection = await this.selectFromCandidates(query, candidateTools, maxTools);
    
    return {
      ...finalSelection,
      selectedCategories: relevantCategories,
      processingTime: Date.now() - startTime,
      selectionMethod: 'hierarchical_with_config'
    };
  }

  private async selectCategoriesFromConfig(query: string, maxCategories: number = 3) {
    const queryLower = query.toLowerCase();
    const categoryScores = new Map<string, number>();

    // ✅ Score categories based on trigger matches
    for (const [categoryName, categoryInfo] of Object.entries(TOOL_CATEGORIES)) {
      let score = 0;
      
      // Get tools in this category
      const categoryToolConfigs = TOOL_CONFIGS.filter(config => 
        config.category === categoryName
      );
      
      // Score based on trigger matches across all tools in category
      for (const toolConfig of categoryToolConfigs) {
        const matchCount = toolConfig.triggers.filter(trigger => 
          queryLower.includes(trigger.toLowerCase())
        ).length;
        score += matchCount;
      }
      
      if (score > 0) {
        categoryScores.set(categoryName, score);
      }
    }

    // ✅ Return top scoring categories
    return Array.from(categoryScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxCategories)
      .map(([categoryName]) => categoryName);
  }

  private getToolsFromCategories(categories: string[]): any[] {
    const toolNames = new Set<string>();
    
    categories.forEach(categoryName => {
      const categoryInfo = TOOL_CATEGORIES[categoryName as keyof typeof TOOL_CATEGORIES];
      if (categoryInfo) {
        categoryInfo.tools.forEach(toolName => toolNames.add(toolName));
      }
    });

    return Array.from(toolNames)
      .map(name => this.getAllTools().find(t => t.name === name))
      .filter(Boolean);
  }

  private async selectFromCandidates(query: string, candidates: any[], maxTools: number) {
    // ✅ Apply semantic selection only to candidate tools
    const filteredConfigs = TOOL_CONFIGS.filter(config => 
      candidates.some(tool => tool.name === config.name)
    );

    // Use existing semantic selection logic but with filtered candidates
    return await this.selectToolsSemantically(query, undefined, maxTools);
  }

  // ✅ Enhanced category-based selection
  async selectToolsByCategory(category: keyof typeof TOOL_CATEGORIES, query: string, maxTools: number = 2) {
    const categoryInfo = TOOL_CATEGORIES[category];
    if (!categoryInfo) {
      return { tools: [], confidenceScores: [], reasonings: [], selectionMethod: 'category_not_found' };
    }

    const categoryTools = this.getToolsFromCategories([category]);
    console.log(`[DEBUG] Category ${category} tools:`, categoryTools.map(t => t.name));

    // Apply semantic selection within category
    return await this.selectFromCandidates(query, categoryTools, maxTools);
  }

  // ✅ Get category information
  getCategoryInfo(category: keyof typeof TOOL_CATEGORIES) {
    return TOOL_CATEGORIES[category];
  }

  // ✅ Get all categories
  getAllCategories() {
    return Object.keys(TOOL_CATEGORIES);
  }

  // ✅ Get tools by category
  getToolsInCategory(category: keyof typeof TOOL_CATEGORIES) {
    const categoryInfo = TOOL_CATEGORIES[category];
    if (!categoryInfo) return [];

    return categoryInfo.tools
      .map(name => this.getAllTools().find(t => t.name === name))
      .filter(Boolean);
  }

  // ✅ Enhanced performance tracking by category
  async recordCategoryUsage(category: keyof typeof TOOL_CATEGORIES, query: string, success: boolean) {
    const categoryTools = this.getToolsInCategory(category);
    
    // Record usage for all tools in the category
    for (const tool of categoryTools) {
      await this.recordToolUsage(tool.name, query, success);
    }
  }
}
