import type { IMiddleware } from "honestjs";
import type { Context, Next } from "hono";

import { auth } from "@/modules/auth/auth.config";

export class AuthMiddleware implements IMiddleware {
  async use(c: Context, next: Next) {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);

    return next();
  }
}
