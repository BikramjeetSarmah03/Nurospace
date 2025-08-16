import * as z from "zod";

const EnvSchema = z.object({
  VITE_SERVER_URL: z.url(),
  VITE_DEV_MODE: z.coerce.boolean(),
});

const { success, data, error } = EnvSchema.safeParse(import.meta.env);

if (!success) {
  console.error("❌ Invalid client env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  throw new Error("Invalid client ENV");
}

export const env = data;
export type ClientEnv = typeof data;

export default env;
