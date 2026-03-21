import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@/types/user";

/**
 * Fetch all users from the database.
 */
export async function getAllUsers(): Promise<User[]> {
  return db.select().from(usersTable).all();
}

/**
 * Insert a new user with a zero balance.
 */
export async function insertUser(
  name: string,
  pfp: string | null
): Promise<void> {
  await db.insert(usersTable).values({ name, amount: 0, pfp }).run();
}

/**
 * Update a user's name and profile picture.
 */
export async function updateUser(
  id: number,
  name: string,
  pfp: string | null
): Promise<void> {
  await db
    .update(usersTable)
    .set({ name, pfp })
    .where(eq(usersTable.id, id))
    .run();
}

/**
 * Delete a user by ID. Transactions cascade-delete via the FK constraint.
 */
export async function deleteUser(id: number): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id)).run();
}
