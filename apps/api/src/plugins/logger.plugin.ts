import type { IPlugin } from "honestjs";
import type { Application } from "honestjs";
import type { Hono } from "hono";

export class LoggerPlugin implements IPlugin {
  private logLevel: string;

  constructor(logLevel = "info") {
    this.logLevel = logLevel;
  }

  async beforeModulesRegistered(app: Application, hono: Hono): Promise<void> {
    console.log(`[LoggerPlugin] Initializing with log level: ${this.logLevel}`);

    // Add a request logging middleware
    hono.use("*", async (c, next) => {
      const start = Date.now();
      console.log(
        `[${new Date().toISOString()}] ${c.req.method} ${c.req.path} - Started`,
      );

      await next();

      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`,
      );
    });
  }

  async afterModulesRegistered(app: Application, hono: Hono): Promise<void> {
    console.log("[LoggerPlugin] All modules registered, logging is active");
  }
}
