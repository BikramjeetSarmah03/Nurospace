import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const userBalance = pgTable("user_balance", {
  id: uuid("id").defaultRandom().primaryKey(),
  credits: integer("credits").default(0),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});

export const userBalanceRelation = relations(user, ({ one }) => ({
  user: one(user, {
    fields: [user.id],
    references: [user.id],
  }),
}));
