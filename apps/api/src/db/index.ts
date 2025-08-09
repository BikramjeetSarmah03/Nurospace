import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@packages/env/server";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, {
  schema,
});
