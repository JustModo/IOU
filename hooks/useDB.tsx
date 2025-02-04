import { useState, useEffect } from "react";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

// Custom Hook for Database Operations
export function useDB() {
  const [users, setUsers] = useState<any[]>([]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const result = await db.select().from(usersTable).all();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Insert a new user
  const addUser = async (name: string, amount: number, pfp: string) => {
    try {
      await db.insert(usersTable).values({ name, amount, pfp }).run();
      fetchUsers();
    } catch (error) {
      console.error("Error inserting user:", error);
    }
  };

  // Delete a user
  const deleteUser = async (id: number) => {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, id)).run();
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, fetchUsers, addUser, deleteUser };
}
