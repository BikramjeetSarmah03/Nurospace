import * as z from "zod";

const EnvSchema = z.object({
  VITE_SERVER_URL: z.string().url(),
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
