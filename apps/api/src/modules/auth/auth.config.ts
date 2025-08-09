import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import env from "@packages/env/server";

import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  basePath: "/api/v1/auth",
  trustedOrigins: [env.CORS_ORIGIN],
  plugins: [],
});
