import { Hono } from "hono";

import { statusRoutes } from "./status.routes";

export const appRouter = new Hono()
  .basePath("/api/v1")
  .route("/status", statusRoutes);

export type AppRouter = typeof appRouter;
