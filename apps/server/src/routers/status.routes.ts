import type { SuccessResponse } from "@productify/types";
import { Hono } from "hono";

export const statusRoutes = new Hono().get("/", (c) => {
  return c.json<SuccessResponse>(
    {
      message: "OK",
      success: true,
    },
    200,
  );
});
