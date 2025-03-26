import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
} from "react";
import { db } from "../db";
import {
  usersTable,
  iouTransactions,
  billTable,
  billTransactions,
} from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";
import { TransactionType } from "@/types/utils";

type DBContextType = {
  users: User[];
  fetchUsers: () => Promise<void>;
  insertUser: (name: string, pfp: string | null) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  updateUser: (
    id: number,
    name: string,
    pfp: string | null
  ) => Promise<boolean>;
  insertIouTransaction: (
    userId: number,
    note: string,
    amount: number,
    type: TransactionType
  ) => Promise<boolean>;
  updateIouTransaction: (
    transactionId: number,
    note: string,
    newAmount: number,
    type: TransactionType
  ) => Promise<boolean>;
  deleteIouTransaction: (id: number) => Promise<boolean>;
  insertBill: (
    title: string,
    amount: number,
    users: string
  ) => Promise<boolean>;
  deleteBill: (id: number) => Promise<boolean>;
  insertBillTransaction: (
    billId: number,
    user: string,
    note: string | null,
    amount: number
  ) => Promise<boolean>;
  deleteBillTransaction: (id: number) => Promise<boolean>;
  fetchTransactionsByID: (id: number) => Promise<IOUTransaction[] | null>;
};

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users
  const fetchUsers = async (): Promise<void> => {
    try {
      const result: User[] = await db.select().from(usersTable).all();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch transaction
  const fetchTransactionsByID = async (
    id: number
  ): Promise<IOUTransaction[] | null> => {
    try {
      const result = await db
        .select()
        .from(iouTransactions)
        .where(eq(iouTransactions.user_id, id))
        .all();
      return result;
    } catch (error) {
      console.error("Error fetching users:", error);
      return null;
    }
  };

  // Insert user
  const insertUser = async (
    name: string,
    pfp: string | null
  ): Promise<boolean> => {
    try {
      await db.insert(usersTable).values({ name, amount: 0, pfp }).run();
      await fetchUsers();
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
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  // Delete user
  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, id)).run();
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  // Insert IOU transaction
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

  // Update IOU transation
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
  // Delete IOU transaction
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

  // Insert Bill
  const insertBill = async (
    title: string,
    amount: number,
    users: string
  ): Promise<boolean> => {
    const date = new Date().toISOString();
    try {
      await db.insert(billTable).values({ title, amount, date, users }).run();
      return true;
    } catch (error) {
      console.error("Error inserting bill:", error);
      return false;
    }
  };

  // Delete Bill
  const deleteBill = async (id: number): Promise<boolean> => {
    try {
      await db.delete(billTable).where(eq(billTable.id, id)).run();
      return true;
    } catch (error) {
      console.error("Error deleting bill:", error);
      return false;
    }
  };

  // Insert Bill Transaction
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
      return true;
    } catch (error) {
      console.error("Error inserting bill transaction:", error);
      return false;
    }
  };

  // Delete Bill Transaction
  const deleteBillTransaction = async (id: number): Promise<boolean> => {
    try {
      await db
        .delete(billTransactions)
        .where(eq(billTransactions.id, id))
        .run();
      return true;
    } catch (error) {
      console.error("Error deleting bill transaction:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <DBContext.Provider
      value={{
        users,
        fetchUsers,
        insertUser,
        updateUser,
        deleteUser,
        insertIouTransaction,
        updateIouTransaction,
        deleteIouTransaction,
        insertBill,
        deleteBill,
        insertBillTransaction,
        deleteBillTransaction,
        fetchTransactionsByID,
      }}
    >
      {children}
    </DBContext.Provider>
  );
};

export const useDB = (): DBContextType => {
  const context = useContext(DBContext);
  if (!context) throw new Error("useDB must be used within a DBProvider");
  return context;
};
