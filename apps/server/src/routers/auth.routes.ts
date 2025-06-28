import { Hono } from "hono";
import { auth } from "@/lib/auth";

export const authRouter = new Hono();

authRouter.get("/", (c) => auth.handler(c.req.raw));
authRouter.post("/", (c) => auth.handler(c.req.raw));
