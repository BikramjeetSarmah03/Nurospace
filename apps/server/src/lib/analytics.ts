/**
 * Analytics and monitoring for the AI agent
 */

interface AgentMetrics {
  requestId: string;
  userId: string;
  queryType: string;
  toolsUsed: string[];
  responseTime: number;
  success: boolean;
  errorType?: string;
  timestamp: Date;
}

class AgentAnalytics {
  private metrics: AgentMetrics[] = [];

  recordRequest(metrics: Omit<AgentMetrics, 'timestamp'>) {
    const record: AgentMetrics = {
      ...metrics,
      timestamp: new Date(),
    };
    
    this.metrics.push(record);
    console.log(`[ANALYTICS] ${record.requestId} - ${record.queryType} - ${record.toolsUsed.join(', ')} - ${record.responseTime}ms`);
  }

  getMetrics() {
    return this.metrics;
  }

  getPerformanceStats() {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);
    
    return {
      totalRequests: this.metrics.length,
      successRate: this.metrics.length > 0 ? (successful.length / this.metrics.length) * 100 : 0,
      averageResponseTime: successful.length > 0 
        ? successful.reduce((sum, m) => sum + m.responseTime, 0) / successful.length 
        : 0,
      toolUsage: this.getToolUsageStats(),
      errorTypes: this.getErrorTypeStats(),
    };
  }

  private getToolUsageStats() {
    const toolCounts: Record<string, number> = {};
    this.metrics.forEach(m => {
      m.toolsUsed.forEach(tool => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    });
    return toolCounts;
  }

  private getErrorTypeStats() {
    const errorCounts: Record<string, number> = {};
    this.metrics.filter(m => !m.success).forEach(m => {
      const errorType = m.errorType || 'unknown';
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });
    return errorCounts;
  }
}

export const agentAnalytics = new AgentAnalytics();

/**
 * Performance monitoring decorator
 */
export function monitorPerformance(requestId: string, userId: string) {
  const startTime = Date.now();
  
  return {
    recordSuccess: (queryType: string, toolsUsed: string[]) => {
      const responseTime = Date.now() - startTime;
      agentAnalytics.recordRequest({
        requestId,
        userId,
        queryType,
        toolsUsed,
        responseTime,
        success: true,
      });
    },
    
    recordError: (queryType: string, toolsUsed: string[], errorType: string) => {
      const responseTime = Date.now() - startTime;
      agentAnalytics.recordRequest({
        requestId,
        userId,
        queryType,
        toolsUsed,
        responseTime,
        success: false,
        errorType,
      });
    },
  };
} 