import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usersTable = sqliteTable("users_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  pfp: text("pfp"),
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

export const billTable = sqliteTable("bill_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
  users: text("users").notNull(),
});

export const billTransactions = sqliteTable("bill_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bill_id: integer("bill_id")
    .notNull()
    .references(() => billTable.id, { onDelete: "cascade" }),
  user: text("user").notNull(),
  note: text("note"),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  iouTransactions: many(iouTransactions),
}));

export const billsRelations = relations(billTable, ({ many }) => ({
  billTransactions: many(billTransactions),
}));
