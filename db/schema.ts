import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usersTable = sqliteTable("users_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  pfp: text("pfp"),
  upi_id: text("upi_id"),
});

export const iouTransactions = sqliteTable("iou_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  iouTransactions: many(iouTransactions),
}));
