import { Hono } from "hono";

import type { SuccessResponse } from "@productify/types";

export const projectRoutes = new Hono().get("/", async (c) => {
  return c.json<SuccessResponse<{ id: number }[]>>({
    message: "Project Fetched",
    success: true,
    data: [{ id: 1 }, { id: 2 }, { id: 3 }],
  });
});
