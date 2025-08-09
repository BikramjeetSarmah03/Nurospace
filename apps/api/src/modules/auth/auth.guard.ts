import type { IGuard } from "honestjs";
import type { Context } from "hono";

export class AuthGuard implements IGuard {
  async canActivate(c: Context): Promise<boolean> {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) return false;

    return true;
  }
}
