import type { Application, IPlugin } from "honestjs";
import { cors } from "hono/cors";
import type { Hono } from "hono";

export class CorsPlugin implements IPlugin {
  constructor(private origins: string[]) {}

  async beforeModulesRegistered(_: Application, hono: Hono): Promise<void> {
    hono.use(
      "*",
      cors({
        origin: this.origins,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS", "DELETE"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
      }),
    );
  }
}
