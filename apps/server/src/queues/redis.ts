import env from "@/config/env";
import type { RedisOptions } from "bullmq";

export const connection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
