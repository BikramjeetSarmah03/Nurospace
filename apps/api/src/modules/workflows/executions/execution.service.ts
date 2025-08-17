import { Service } from "honestjs";
import type { User } from "better-auth";
import { HTTPException } from "hono/http-exception";
import { and, asc, eq, inArray, type InferSelectModel } from "drizzle-orm";
import type { Browser, Page } from "puppeteer";

import { db } from "@/db";
import { executionPhase, workflow, workflowExecution } from "@/db/schema";

import {
  IExecutionPhaseStatus,
  IWorkflowExecutionStatus,
  IWorkflowExecutionTrigger,
} from "@packages/workflow/types/workflow.ts";
import { FlowToExecutionPlan } from "@packages/workflow/lib/execution-plan.ts";
import { TaskRegistry } from "@packages/workflow/registry/task/registry.ts";
import { ExecutorRegistry } from "@packages/workflow/registry/executor/registry.ts";
import type { AppNode, Edge } from "@packages/workflow/types/app-node.ts";
import type {
  Environment,
  ExecutionEnvironment,
} from "@packages/workflow/types/executor.ts";

import type { RunWorkflowDto } from "./dto/run-workflow";
import WorkflowService from "../workflows.service";
import { TaskParamType } from "@packages/workflow/types/task.ts";

@Service()
export default class ExecuctionService {
  private readonly workflowService = new WorkflowService();

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
          defination: body.flowDefination,
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

    const edges = JSON.parse(execution.defination || "").edges as Edge[];

    // Setup execution env
    const environment: Environment = {
      phases: {},
    };

    // Initialize workflow execution
    await this.initializeWorkflowExecution(executionId, execution.workflowId);

    //  initialize phases status
    await this.initializePhaseStatuses(execution);

    const creditsConsumed = 0;
    let executionFailed = false;
    console.log({ executionFailed });
    for (const phase of execution.phases) {
      // TODO: consume credits
      console.log({ creditsConsumed });

      // Execute phase
      const phaseExecution = await this.executeWorkflowPhase(
        phase,
        environment,
        edges,
      );

      if (!phaseExecution.success) {
        executionFailed = true;
        break;
      }
    }

    // Finalize execution
    await this.finalizeWokflowExecution(
      executionId,
      execution.workflowId,
      executionFailed,
      creditsConsumed,
    );

    //  cleanup env
    await this.cleanUpEnvironment(environment);

    // revalidate run path
  }

  async initializeWorkflowExecution(executionId: string, workflowId: string) {
    await db
      .update(workflowExecution)
      .set({
        startedAt: new Date(),
        status: IWorkflowExecutionStatus.RUNNING, // assuming this is a string enum
      })
      .where(eq(workflowExecution.id, executionId));

    await db
      .update(workflow)
      .set({
        lastRunAt: new Date(),
        lastRunStatus: IWorkflowExecutionStatus.RUNNING,
        lastRunId: executionId,
      })
      .where(eq(workflow.id, workflowId));
  }

  async initializePhaseStatuses(execution: IWorkflowExecution) {
    const phaseIds = execution?.phases?.map((ph) => ph.id);

    if (!Array.isArray(phaseIds) || phaseIds.length === 0) {
      throw new Error("Invalid or empty phase IDs");
    }

    await db
      .update(executionPhase)
      .set({
        status: IExecutionPhaseStatus.PENDING,
      })
      .where(inArray(executionPhase.id, phaseIds));
  }

  async finalizeWokflowExecution(
    executionId: string,
    workflowId: string,
    executionFailed: boolean,
    creditsConsumed: number,
  ) {
    const finalStatus = executionFailed
      ? IWorkflowExecutionStatus.FAILED
      : IWorkflowExecutionStatus.COMPLETED;

    await db
      .update(workflowExecution)
      .set({
        status: finalStatus,
        completedAt: new Date(),
        creditsConsumed,
      })
      .where(eq(workflowExecution.id, executionId));

    await db
      .update(workflow)
      .set({
        lastRunStatus: finalStatus,
      })
      .where(
        and(eq(workflow.id, workflowId), eq(workflow.lastRunId, executionId)),
      )
      .catch((err) => {
        // ignoe
        // this means that we have triggered other runs for this workflow
        // while an execution was running
      });
  }

  async executeWorkflowPhase(
    phase: InferSelectModel<typeof executionPhase>,
    environment: Environment,
    edges: Edge[],
  ) {
    const startedAt = new Date();
    const node = JSON.parse(phase.node || "{}") as AppNode;

    await this.setupEnvironmentForPhase(node, environment, edges);

    await db
      .update(executionPhase)
      .set({
        status: IExecutionPhaseStatus.RUNNING,
        startedAt,
        inputs: JSON.stringify(environment.phases[node.id]?.inputs ?? "[]"),
      })
      .where(eq(executionPhase.id, phase.id));

    const creditsRequired = TaskRegistry[node.data.type].credits;
    console.log(
      `Executing phase: ${phase.name} with ${creditsRequired} credits required`,
    );

    // Decrement user balance ( with required credits )
    const success = await this.executePhase(phase, node, environment);

    const outputs = environment.phases[node.id]?.outputs;

    await this.finalizePhase(phase.id, success, outputs);
    return { success };
  }

  async finalizePhase(
    phaseId: string,
    success: boolean,
    outputs: Record<string, string> | undefined,
  ) {
    const finalStatus = success
      ? IExecutionPhaseStatus.COMPLETED
      : IExecutionPhaseStatus.FAILED;

    await db
      .update(executionPhase)
      .set({
        status: finalStatus,
        completedAt: new Date(),
        outputs: JSON.stringify(outputs),
      })
      .where(eq(executionPhase.id, phaseId));
  }

  async executePhase(
    phase: InferSelectModel<typeof executionPhase>,
    node: AppNode,
    environment: Environment,
  ): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type];

    if (!runFn) return false;

    const executionEnvironment: ExecutionEnvironment<any> =
      this.createExecutionEnvironment(node, environment);

    return await runFn(executionEnvironment);
  }

  async setupEnvironmentForPhase(
    node: AppNode,
    environment: Environment,
    edges: Edge[],
  ) {
    environment.phases[node.id] = {
      inputs: {},
      outputs: {},
    };

    const inputs = TaskRegistry[node.data.type].inputs || [];

    for (const input of inputs) {
      if (input.type === TaskParamType.BROWSER_INSTANCE) continue;

      // ensule phase exist
      if (!environment.phases[node.id]) {
        environment.phases[node.id] = { inputs: {}, outputs: {} };
      }

      let resolvedValue: string | undefined = node.data.inputs[input.name];

      // if no hardcoded value, check edge
      if (!resolvedValue) {
        const connectedEdge = edges.find(
          (edg) => edg.target === node.id && edg.targetHandle === input.name,
        );

        console.log({ connectedEdge });
        if (connectedEdge) {
          const sourcePhase = environment.phases[connectedEdge.source];
          resolvedValue = sourcePhase?.outputs[connectedEdge.sourceHandle!];
        }
      }

      // always set input (even if undefined)
      environment.phases[node.id]!.inputs[input.name] = resolvedValue ?? "";
    }
  }

  createExecutionEnvironment(
    node: AppNode,
    environment: Environment,
  ): ExecutionEnvironment<any> {
    return {
      getInput: (name: string) =>
        environment.phases[node.id]?.inputs[name] ?? "",
      setOutput: (name: string, value: string) => {
        if (!environment.phases[node.id]) {
          environment.phases[node.id] = { inputs: {}, outputs: {} };
        }
        environment.phases[node.id]!.outputs[name] = value;
      },

      getBrowser: () => environment.browser,
      setBrowser: (browser: Browser) => {
        environment.browser = browser;
      },

      getPage: () => environment.page,
      setPage: (page: Page) => {
        environment.page = page;
      },
    };
  }

  async cleanUpEnvironment(environment: Environment) {
    if (environment.browser) {
      await environment.browser
        .close()
        .catch((err) => console.error("Cannot close browser: ", err));
    }
  }
}

interface IWorkflowExecution
  extends InferSelectModel<typeof workflowExecution> {
  phases: InferSelectModel<typeof executionPhase>[];
  workflow: InferSelectModel<typeof workflow>;
}
