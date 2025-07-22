import { Hono } from "hono";
import { isAuthenticated } from "@/middleware/auth";
import { getRateLimitInfo } from "@/lib/utils";
import { agentAnalytics } from "@/lib/analytics";

import type { SuccessResponse } from "@productify/shared/types";

export const statusRoutes = new Hono()
  .get("/", (c) => {
    return c.json<SuccessResponse>(
      {
        message: "OK",
        success: true,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  })
    .get("/rate-limit", isAuthenticated, (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const rateLimitInfo = getRateLimitInfo(userId);
    return c.json({
      success: true,
      rateLimitInfo,
      timestamp: new Date().toISOString(),
    });
  })
  .get("/analytics", isAuthenticated, (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const stats = agentAnalytics.getPerformanceStats();
    return c.json({
      success: true,
      analytics: stats,
      timestamp: new Date().toISOString(),
    });
  });
