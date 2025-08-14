import { and, eq } from "drizzle-orm";
import { Service } from "honestjs";
import { HTTPException } from "hono/http-exception";
import { v4 as uuidV4 } from "uuid";

import { db } from "@/db";
import { workflow } from "@/db/schema";
import type { CreateWorkflowDto } from "./dto/create-workflow";

@Service()
export default class WorkflowService {
  async createWorkflow(body: CreateWorkflowDto, userId: string) {
    const { name, description } = body;

    const slug = this.generateSlug(name);

    const [newWorkflow] = await db
      .insert(workflow)
      .values({
        name,
        description,
        userId,
        slug,
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      success: true,
      data: newWorkflow,
    };
  }

  async getAllWorkflows(userId: string) {
    const data = await db.query.workflow.findMany({
      where: eq(workflow.userId, userId),
    });

    return {
      success: true,
      data,
    };
  }

  async getWorkflowDetails(workflowId: string, userId: string) {
    const result = await db.query.workflow.findFirst({
      where: and(eq(workflow.id, workflowId), eq(workflow.userId, userId)),
    });

    if (!result) throw new HTTPException(404, { message: "Not Found" });

    return {
      success: true,
      data: result,
    };
  }

  async deleteWorkflow(workflowId: string, userId: string) {
    const result = await db
      .delete(workflow)
      .where(and(eq(workflow.id, workflowId), eq(workflow.userId, userId)))
      .returning(); // returns the deleted row(s)

    if (result.length === 0) {
      throw new HTTPException(404, {
        message: "Workflow not found or access denied",
      });
    }

    return {
      success: true,
      data: result[0],
    };
  }

  generateSlug(input: string): string {
    const rawSlug = input.slice(0, 30).toLowerCase() ?? "workflow";
    const sanitizedSlug = rawSlug
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return `${sanitizedSlug}-${uuidV4()}`;
  }
}
