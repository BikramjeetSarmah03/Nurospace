import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { SuccessResponse } from "@productify/shared/types";
import { ProjectSchema } from "@productify/shared/schemas/project";

import { isAuthenticated } from "@/middleware/auth";

export const projectRoutes = new Hono()
  .get("/", isAuthenticated, async (c) => {
    return c.json<SuccessResponse<{ id: number }[]>>({
      message: "Project Fetched",
      success: true,
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });
  })
  .post("/", isAuthenticated, zValidator("json", ProjectSchema), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    return c.json<SuccessResponse<{ id: number; name: string; user?: string }>>(
      {
        message: "Project Created",
        success: true,
        data: { id: 1, name: body.name, user: user?.name },
      },
    );
  });
