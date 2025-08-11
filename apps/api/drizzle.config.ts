import { defineConfig } from "drizzle-kit";
import env from "@packages/env/server";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL || "",
  },
});
