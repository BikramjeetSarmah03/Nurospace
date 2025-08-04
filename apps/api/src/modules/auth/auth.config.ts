import env from "@/config/env";
import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  basePath: "/api/v1/auth",
  trustedOrigins: [env.CORS_ORIGIN],
  plugins: [nextCookies()],
});
