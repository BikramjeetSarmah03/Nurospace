import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
