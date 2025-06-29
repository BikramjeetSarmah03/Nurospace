import "dotenv/config";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";

import type { ErrorResponse } from "@productify/shared/types";

import { auth } from "./lib/auth";

import { appRouter } from "./routers";
import type { Context } from "./config/context";

const app = new Hono<Context>();

app.use(logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  },
);

app.route("/", appRouter);
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json<ErrorResponse>({
        success: false,
        error: err.message,
        message: err.message,
      });

    return errResponse;
  }

  return c.json<ErrorResponse>({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : (err.stack ?? err.message),
  });
});

export default app;
