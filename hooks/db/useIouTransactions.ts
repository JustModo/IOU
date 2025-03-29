import { db } from "../../db";
import { iouTransactions } from "../../db/schema";
import { eq } from "drizzle-orm";
import { IOUTransaction } from "@/types/transaction";
import { TransactionType } from "@/types/utils";

export const useIouTransactions = (fetchUsers: () => Promise<void>) => {
  const insertIouTransaction = async (
    userId: number,
    note: string,
    amount: number,
    type: TransactionType
  ): Promise<boolean> => {
    const date = new Date().toISOString();
    try {
      await db
        .insert(iouTransactions)
        .values({ user_id: userId, note, amount, date, type })
        .run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error inserting IOU transaction:", error);
      return false;
    }
  };

  const updateIouTransaction = async (
    transactionId: number,
    note: string,
    newAmount: number,
    type: TransactionType
  ): Promise<boolean> => {
    try {
      await db
        .update(iouTransactions)
        .set({ note, amount: newAmount, type })
        .where(eq(iouTransactions.id, transactionId))
        .run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error updating IOU transaction:", error);
      return false;
    }
  };

  const deleteIouTransaction = async (id: number): Promise<boolean> => {
    try {
      await db.delete(iouTransactions).where(eq(iouTransactions.id, id)).run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error deleting IOU transaction:", error);
      return false;
    }
  };

  const fetchTransactionsByID = async (
    id: number
  ): Promise<IOUTransaction[] | null> => {
    try {
      const result = await db
        .select()
        .from(iouTransactions)
        .where(eq(iouTransactions.user_id, id))
        .all();
      await fetchUsers();
      return result;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  };

  return [
    insertIouTransaction,
    updateIouTransaction,
    deleteIouTransaction,
    fetchTransactionsByID,
  ] as const;
};
