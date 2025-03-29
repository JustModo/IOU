import { eq } from "drizzle-orm";
import { db } from "../../db";
import { billTable } from "../../db/schema";

export const useBills = (fetchUsers: () => Promise<void>) => {
  const insertBill = async (
    title: string,
    amount: number,
    users: string
  ): Promise<boolean> => {
    const date = new Date().toISOString();
    try {
      await db.insert(billTable).values({ title, amount, date, users }).run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error inserting bill:", error);
      return false;
    }
  };

  const deleteBill = async (id: number): Promise<boolean> => {
    try {
      await db.delete(billTable).where(eq(billTable.id, id)).run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error deleting bill:", error);
      return false;
    }
  };

  return [insertBill, deleteBill] as const;
};
