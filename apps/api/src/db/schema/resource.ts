import { pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  type: text("type").notNull(),
  projectId: uuid("project_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const resourceEmbeddings = pgTable("resource_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id, {
      onDelete: "cascade",
    }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
});
