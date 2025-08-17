import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const workflow = pgTable(
  "workflows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    defination: text("defination"),
    execuationPlan: text("execution_plan"),
    oron: text("oron"),
    status: text("status").default("DRAFT"), // DRAFT | PUBLISHED
    creditCost: integer("credit_cost"),
    lastRunId: text("last_run_id"),
    lastRunStatus: text("last_run_status"),
    lastRunAt: timestamp("last_run_at"),
    nextRunAt: timestamp("next_run_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (workflow) => ({
    uniqueUserSlug: unique().on(workflow.userId, workflow.slug),
  }),
);

export const workflowExecution = pgTable("workflow_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  workflowId: uuid("workflow_id")
    .references(() => workflow.id, {
      onDelete: "cascade",
    })
    .notNull(),
  trigger: text("trigger"),
  status: text("status"),
  defination: text("defination"),
  creditsConsumed: integer("credits_consumed").default(0),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const executionPhase = pgTable("execution_phase", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  workflowExecutionId: uuid("workflow_execution_id")
    .references(() => workflowExecution.id, {
      onDelete: "cascade",
    })
    .notNull(),
  status: text("status"),
  number: integer("number"),
  node: text("node"),
  name: text("name"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  inputs: text("inputs"),
  outputs: text("outputs"),
  creditsConsumed: integer("credits_consumed"),
});

// 👤 User → Workflows, WorkflowExecutions, ExecutionPhases
export const userRelations = relations(user, ({ many }) => ({
  workflows: many(workflow),
  workflowExecutions: many(workflowExecution),
  executionPhases: many(executionPhase),
}));

// 📋 Workflow → User, WorkflowExecutions
export const workflowRelations = relations(workflow, ({ many, one }) => ({
  executions: many(workflowExecution),
  user: one(user, {
    fields: [workflow.userId],
    references: [user.id],
  }),
}));

// ▶️ WorkflowExecution → User, Workflow, ExecutionPhases
export const workflowExecutionRelations = relations(
  workflowExecution,
  ({ one, many }) => ({
    user: one(user, {
      fields: [workflowExecution.userId],
      references: [user.id],
    }),
    workflow: one(workflow, {
      fields: [workflowExecution.workflowId],
      references: [workflow.id],
    }),
    phases: many(executionPhase),
  }),
);

// 🔁 executionPhase → User, WorkflowExecution
export const executionPhaseRelations = relations(executionPhase, ({ one }) => ({
  user: one(user, {
    fields: [executionPhase.userId],
    references: [user.id],
  }),
  workflowExecution: one(workflowExecution, {
    fields: [executionPhase.workflowExecutionId],
    references: [workflowExecution.id],
  }),
}));
