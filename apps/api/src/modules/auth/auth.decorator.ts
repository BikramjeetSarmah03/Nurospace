import { createParamDecorator } from "honestjs";
import type { Context } from "hono";

import type { Session, User } from "better-auth";

export type IAuthContext = {
  user: User;
  session: Session;
};

export const AuthContext = createParamDecorator(
  "auth_context",
  (_, ctx: Context) => {
    const user = ctx.get("user") as User;
    const session = ctx.get("session");

    return {
      user,
      session,
    } as IAuthContext;
  },
);
