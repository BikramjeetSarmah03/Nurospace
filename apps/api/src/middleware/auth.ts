import type { MiddlewareHandler } from "hono";

export const isAuthenticated: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  const session = c.get("session");
  if (!user || !session) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  await next();
};
