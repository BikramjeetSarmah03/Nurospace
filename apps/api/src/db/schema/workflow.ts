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
    status: text("status").default("DRAFT"),
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

// export const workflowExecution = pgTable("workflow_executions", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userId: text("user_id")
//     .references(() => user.id, { onDelete: "cascade" })
//     .notNull(),
//   workflowId: uuid("workflow_id")
//     .references(() => workflow.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   trigger: text("trigger"),
//   status: text("status"),
//   creditsConsumed: integer("credits_consumed"),
//   createdAt: timestamp("created_at")
//     .$defaultFn(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   startedAt: timestamp("started_at"),
//   completedAt: timestamp("completed_at"),
// });

// export const ExecutionPhase = pgTable("execution_phase", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userId: text("user_id")
//     .references(() => user.id, { onDelete: "cascade" })
//     .notNull(),
//   workflowExecutionId: uuid("workflow_execution_id")
//     .references(() => workflowExecution.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//     status:text("status"),
//     number:integer("number")
// });

export const userRelations = relations(user, ({ many }) => ({
  workflows: many(workflow),
}));
