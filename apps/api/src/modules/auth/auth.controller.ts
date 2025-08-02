import { All, Controller, Ctx } from "honestjs";
import type { Context } from "hono";

import { auth } from "./auth.config";

@Controller("auth/**")
export default class AuthController {
  @All("")
  async handleAuth(@Ctx() ctx: Context) {
    return auth.handler(ctx.req.raw);
  }
}
