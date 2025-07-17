import { pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const resourcesTable = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  type: text("type").notNull(),

  projectId: uuid("project_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resourceEmbeddings = pgTable("resource_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resourcesTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
});
