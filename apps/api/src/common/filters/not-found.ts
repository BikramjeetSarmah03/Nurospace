import type { Context } from "hono";

export const NotFound = (context: Context) => {
  return context.json(
    {
      status: 404,
      message: "Not Found",
      details: `Route ${context.req.path} not found`,
      timestamp: new Date().toISOString(),
      suggestions: ["/api/v1/health"],
    },
    404,
  );
};
