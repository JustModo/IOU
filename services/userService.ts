import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@/types/user";

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(usersTable).all();
}

export async function insertUser(name: string, pfp: string | null): Promise<void> {
  await db.insert(usersTable).values({ name, amount: 0, pfp }).run();
}

export async function updateUser(id: number, name: string, pfp: string | null): Promise<void> {
  await db.update(usersTable).set({ name, pfp }).where(eq(usersTable.id, id)).run();
}

export async function deleteUser(id: number): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id)).run();
}
