import { eq } from "drizzle-orm";
import { db } from "../../db";
import { billTable } from "../../db/schema";

export const useBills = (fetchAll: () => Promise<void>) => {
  const insertBill = async (title: string, users: string): Promise<boolean> => {
    const date = new Date().toISOString();
    const amount = 0;
    try {
      await db.insert(billTable).values({ title, amount, date, users }).run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error inserting bill:", error);
      return false;
    }
  };

  const deleteBill = async (id: number): Promise<boolean> => {
    try {
      await db.delete(billTable).where(eq(billTable.id, id)).run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error deleting bill:", error);
      return false;
    }
  };

  const updateBill = async (
    id: number,
    title: string,
    users: string
  ): Promise<boolean> => {
    try {
      await db
        .update(billTable)
        .set({ title, users })
        .where(eq(billTable.id, id))
        .run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error updating bill:", error);
      return false;
    }
  };

  return [insertBill, deleteBill, updateBill] as const;

};
