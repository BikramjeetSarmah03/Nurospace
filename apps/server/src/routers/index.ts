import { Hono } from "hono";

import { statusRoutes } from "./status.routes";
import { projectRoutes } from "./project.routes";

export const appRouter = new Hono()
  .basePath("/api/v1")
  .route("/status", statusRoutes)
  .route("/projects", projectRoutes);

export type AppRouter = typeof appRouter;
