import { db } from "@/db";
import { iouTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IOUTransaction } from "@/types/transaction";
import { TransactionType } from "@/types/utils";

export async function getTransactionsByUserId(userId: number): Promise<IOUTransaction[]> {
  return db.select().from(iouTransactions).where(eq(iouTransactions.user_id, userId)).all();
}

export async function insertTransaction(
  userId: number,
  note: string,
  amount: number,
  type: TransactionType
): Promise<void> {
  const date = new Date().toISOString();
  await db.insert(iouTransactions).values({ user_id: userId, note, amount, date, type }).run();
}

export async function updateTransaction(
  id: number,
  note: string,
  amount: number,
  type: TransactionType
): Promise<void> {
  await db.update(iouTransactions).set({ note, amount, type }).where(eq(iouTransactions.id, id)).run();
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(iouTransactions).where(eq(iouTransactions.id, id)).run();
}
