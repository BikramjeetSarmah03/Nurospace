import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
