import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const useUsers = (fetchAll: () => Promise<void>) => {
  const insertUser = async (
    name: string,
    pfp: string | null
  ): Promise<boolean> => {
    try {
      await db.insert(usersTable).values({ name, amount: 0, pfp }).run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error inserting user:", error);
      return false;
    }
  };

  const updateUser = async (
    id: number,
    name: string,
    pfp: string | null
  ): Promise<boolean> => {
    try {
      await db
        .update(usersTable)
        .set({ name, pfp })
        .where(eq(usersTable.id, id))
        .run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, id)).run();
      await fetchAll();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  return [insertUser, updateUser, deleteUser] as const;
};
