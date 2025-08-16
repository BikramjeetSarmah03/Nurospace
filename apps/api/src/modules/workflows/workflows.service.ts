import { and, asc, eq } from "drizzle-orm";
import { Service } from "honestjs";
import { HTTPException } from "hono/http-exception";
import { v4 as uuidV4 } from "uuid";
import type { User } from "better-auth";

import { FlowToExecutionPlan } from "@packages/workflow/lib/execution-plan.ts";
import { CreateFlowNode } from "@packages/workflow/lib/create-flow-node.ts";

import type { AppNode, Edge } from "@packages/workflow/types/app-node.ts";
import {
  IExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  IWorkflowExecutionTrigger,
} from "@packages/workflow/types/workflow.ts";
import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";
import { TaskType } from "@packages/workflow/types/task.ts";

import { db } from "@/db";
import { ExecutionPhase, workflow, workflowExecution } from "@/db/schema";

import type { CreateWorkflowDto } from "./dto/create-workflow";
import type { UpdateWorkflowDto } from "./dto/update-workflow";
import type { RunWorkflowDto } from "./dto/run-workflow";

@Service()
export default class WorkflowService {
  async createWorkflow(body: CreateWorkflowDto, userId: string) {
    const { name, description } = body;

    const slug = this.generateSlug(name);

    const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
      nodes: [],
      edges: [],
    };

    // add the flow entry point
    initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

    const [newWorkflow] = await db
      .insert(workflow)
      .values({
        name,
        description,
        userId,
        slug,
        defination: JSON.stringify(initialFlow),
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

  async updateWorkflow(
    workflowId: string,
    body: UpdateWorkflowDto,
    userId: string,
  ) {
    const { defination } = body;

    const [updatedWorkflow] = await db
      .update(workflow)
      .set({
        defination,
        updatedAt: new Date(),
      })
      .where(and(eq(workflow.id, workflowId), eq(workflow.userId, userId)))
      .returning();

    if (!updatedWorkflow) {
      return {
        success: false,
        message: "Workflow not found",
      };
    }

    return {
      success: true,
      data: updatedWorkflow,
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

  async runWorkflow(worflowId: string, body: RunWorkflowDto, user: User) {
    const { flowDefination } = body;

    if (!flowDefination)
      throw new HTTPException(404, {
        message: "Flow Defination is not defined",
      });

    const workflow = await this.getWorkflowDetails(worflowId, user.id);

    if (!workflow.data)
      throw new HTTPException(404, { message: "Workflow not found" });

    const flow = JSON.parse(flowDefination);
    const result = FlowToExecutionPlan(flow.nodes, flow.edges);

    if (result.error)
      throw new HTTPException(400, { message: "Flow defination not valid" });

    if (!result.executionPlan)
      throw new HTTPException(404, {
        message: "No execution plan generated",
      });

    const executionPlan = result.executionPlan;

    // 3. Transaction: Insert execution + phases
    const execution = await db.transaction(async (tx) => {
      // a. Insert workflow execution
      const [insertedExecution] = await tx
        .insert(workflowExecution)
        .values({
          workflowId: workflow.data.id,
          userId: user.id,
          status: IWorkflowExecutionStatus.PENDING,
          startedAt: new Date(),
          trigger: IWorkflowExecutionTrigger.MANUAL,
        })
        .returning({
          id: workflowExecution.id,
        });

      if (!insertedExecution) {
        throw new HTTPException(500, {
          message: "Workflow execution could not be created",
        });
      }

      // b. Prepare phases
      const phases = executionPlan.flatMap((phase) =>
        phase.nodes.map((node) => ({
          userId: user.id,
          workflowExecutionId: insertedExecution.id,
          status: IExecutionPhaseStatus.CREATED,
          number: phase.phase,
          node: JSON.stringify(node),
          name: TaskRegistry[node.data.type].label,
        })),
      );

      // c. Insert phases
      await tx.insert(ExecutionPhase).values(phases);

      return {
        id: insertedExecution.id,
        phases,
      };
    });

    if (!execution)
      throw new HTTPException(500, {
        message: "Workflow Execution not created",
      });

    return {
      success: true,
      data: {
        workflowId: workflow.data.id,
        executionId: execution.id,
      },
    };
  }

  async getWorkflowExecutionWithPhases(executionId: string, userId: string) {
    const data = await db.query.workflowExecution.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, executionId), eq(fields.userId, userId)),
      with: {
        phases: {
          orderBy: (fields) => [asc(fields.number)],
        },
      },
    });

    if (!data) {
      throw new HTTPException(404, { message: "Execution not found" });
    }

    return {
      success: true,
      data,
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
