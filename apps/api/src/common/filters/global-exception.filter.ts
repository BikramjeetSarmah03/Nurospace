import type { IFilter } from "honestjs";
import type { Context } from "hono";

export class GlobalExceptionFilter implements IFilter {
  async catch(error: Error, context: Context) {
    console.error("Unhandled error:", error);

    // Log error details
    console.error("Stack trace:", error.stack);
    console.error("Request path:", context.req.path);
    console.error("Request method:", context.req.method);

    // Return appropriate response based on environment
    if (process.env.NODE_ENV === "production") {
      return context.json(
        {
          status: 500,
          message: "Internal Server Error",
          timestamp: new Date().toISOString(),
          path: context.req.path,
        },
        500,
      );
    }

    return context.json(
      {
        status: 500,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        path: context.req.path,
      },
      500,
    );
  }
}
