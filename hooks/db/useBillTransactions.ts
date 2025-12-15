import { eq } from "drizzle-orm";
import { db } from "../../db";
import { billTransactions } from "../../db/schema";

export const useBillTransactions = (fetchAll: () => Promise<void>) => {
  const insertBillTransaction = async (
    billId: number,
    user: string,
    note: string | null,
    amount: number
  ): Promise<boolean> => {
    const date = new Date().toISOString();
    try {
      await db
        .insert(billTransactions)
        .values({ bill_id: billId, user, note, amount, date })
        .run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error inserting bill transaction:", error);
      return false;
    }
  };

  const deleteBillTransaction = async (id: number): Promise<boolean> => {
    try {
      await db
        .delete(billTransactions)
        .where(eq(billTransactions.id, id))
        .run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error deleting bill transaction:", error);
      return false;
    }
  };

  const getBillTransactions = async (billId: number) => {
    try {
      const transactions = await db
        .select()
        .from(billTransactions)
        .where(eq(billTransactions.bill_id, billId));
      return transactions;
    } catch (error) {
      console.error("Error fetching bill transactions:", error);
      return [];
    }
  };

  return [
    insertBillTransaction,
    deleteBillTransaction,
    getBillTransactions,
  ] as const;

};
