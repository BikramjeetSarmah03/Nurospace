import { Hono } from "hono";

import type { SuccessResponse } from "@productify/shared/types";

export const statusRoutes = new Hono().get("/", (c) => {
  return c.json<SuccessResponse>(
    {
      message: "OK",
      success: true,
    },
    200,
  );
});
