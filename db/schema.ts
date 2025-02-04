import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  pfp: text("pfp"),
});
