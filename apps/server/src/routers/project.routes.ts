import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { SuccessResponse } from "@productify/shared/types";
import { ProjectSchema } from "@productify/shared/schemas/project";

export const projectRoutes = new Hono()
  .get("/", async (c) => {
    return c.json<SuccessResponse<{ id: number }[]>>({
      message: "Project Fetched",
      success: true,
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });
  })
  .post("/", zValidator("json", ProjectSchema), async (c) => {
    const body = c.req.valid("json");

    return c.json<SuccessResponse<{ id: number; name: string }>>({
      message: "Project Created",
      success: true,
      data: { id: 1, name: body.name },
    });
  });
