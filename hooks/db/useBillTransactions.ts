import { eq } from "drizzle-orm";
import { db } from "../../db";
import { billTransactions, billTable } from "../../db/schema";

export const useBillTransactions = (fetchAll: () => Promise<void>) => {
  const updateBillTotal = async (billId: number) => {
    try {
      const transactions = await db
        .select()
        .from(billTransactions)
        .where(eq(billTransactions.bill_id, billId));
      
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);

      await db
        .update(billTable)
        .set({ amount: total })
        .where(eq(billTable.id, billId))
        .run();
    } catch (error) {
      console.error("Error updating bill total:", error);
    }
  };

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
      await updateBillTotal(billId);
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error inserting bill transaction:", error);
      return false;
    }
  };

  const deleteBillTransaction = async (id: number): Promise<boolean> => {
    try {
      // Fetch transaction to get bill_id before deleting
      const tx = await db
        .select()
        .from(billTransactions)
        .where(eq(billTransactions.id, id))
        .get();

      if (!tx) return false;

      await db
        .delete(billTransactions)
        .where(eq(billTransactions.id, id))
        .run();
        
      await updateBillTotal(tx.bill_id);
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

  const updateBillTransaction = async (
    id: number,
    note: string,
    amount: number
  ): Promise<boolean> => {
    try {
        const tx = await db
        .select()
        .from(billTransactions)
        .where(eq(billTransactions.id, id))
        .get();

      if (!tx) return false;

      await db
        .update(billTransactions)
        .set({ note, amount })
        .where(eq(billTransactions.id, id))
        .run();
        
      await updateBillTotal(tx.bill_id);
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error updating bill transaction:", error);
      return false;
    }
  };

  return [
    insertBillTransaction,
    deleteBillTransaction,
    getBillTransactions,
    updateBillTransaction,
  ] as const;

};
