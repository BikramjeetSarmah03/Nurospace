import { Hono } from "hono";

import { statusRoutes } from "./status.routes";
import { projectRoutes } from "./project.routes";
import { chatRoutes } from "./chat.routes";
import { resourcesRoutes } from "./resources.routes";

export const appRouter = new Hono()
  .basePath("/api/v1")
  .route("/status", statusRoutes)
  .route("/projects", projectRoutes)
  .route("/chat", chatRoutes)
  .route("/resources", resourcesRoutes);

export type AppRouter = typeof appRouter;
