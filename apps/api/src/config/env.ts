import * as z from "zod";

import path from "node:path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd()),
});

const EnvSchema = z.object({
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(
  process.env.NODE_ENV === "production" ? process.env : import.meta.env,
);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  throw Error("Invalid ENV");
}

// biome-ignore lint/style/noNonNullAssertion: <it will always be defined>
export default env!;
