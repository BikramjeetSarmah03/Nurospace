import { Service } from "honestjs";
import type { User } from "better-auth";
import { HTTPException } from "hono/http-exception";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { executionPhase, workflowExecution } from "@/db/schema";

import {
  IExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  IWorkflowExecutionTrigger,
} from "@packages/workflow/types/workflow.ts";
import { FlowToExecutionPlan } from "@packages/workflow/lib/execution-plan.ts";
import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";

import type { RunWorkflowDto } from "./dto/run-workflow";
import WorkflowService from "../workflows.service";

@Service()
export default class ExecuctionService {
  private readonly workflowService = new WorkflowService();

  async runWorkflow(worflowId: string, body: RunWorkflowDto, user: User) {
    const { flowDefination } = body;

    if (!flowDefination)
      throw new HTTPException(404, {
        message: "Flow Defination is not defined",
      });

    const workflow = await this.workflowService.getWorkflowDetails(
      worflowId,
      user.id,
    );

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
      await tx.insert(executionPhase).values(phases);

      return {
        id: insertedExecution.id,
        phases,
      };
    });

    if (!execution)
      throw new HTTPException(500, {
        message: "Workflow Execution not created",
      });

    this.executeWorkflow(execution.id);
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

    return data;
  }

  async getPhaseDetails(phaseId: string, userId: string) {
    const data = await db.query.executionPhase.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, phaseId), eq(fields.userId, userId)),
    });

    if (!data) {
      throw new HTTPException(404, { message: "Phase not found" });
    }

    return data;
  }

  async executeWorkflow(executionId: string) {
    const execution = await this.getExecution(executionId);

    if (!execution)
      throw new HTTPException(404, { message: "Execution not found" });

    // TODO: setup execution env

    // TODO: initialize workflow execution
    // TODO: initialize phases status

    const executionFailed = false;
    console.log({ executionFailed });
    for (const phase of execution.phases) {
      console.log({ phase });
      // TODO: execute phase
    }

    // TODO: finalize execution
    // TODO: cleanup env

    // revalidate run path
  }

  async getExecution(executionId: string) {
    return await db.query.workflowExecution.findFirst({
      where: (field, { eq }) => eq(field.id, executionId),
      with: {
        phases: {
          orderBy: (fields) => [asc(fields.number)],
        },
        workflow: true,
      },
    });
  }
}
