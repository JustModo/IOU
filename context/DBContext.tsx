import {
  createContext,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";
import { TransactionType } from "@/types/utils";
import { useUsers, useIouTransactions } from "@/hooks/db";
import { usersTable } from "@/db/schema";
import { db } from "@/db";

type DBContextType = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  fetchData: () => Promise<void>;
  insertUser: (name: string, pfp: string | null) => Promise<boolean>;
  updateUser: (
    id: number,
    name: string,
    pfp: string | null
  ) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
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
  fetchTransactionsByID: (id: number) => Promise<IOUTransaction[] | null>;
};

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchData = async (): Promise<void> => {
    try {
      const fetchedUsers: User[] = await db.select().from(usersTable).all();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [insertUser, updateUser, deleteUser] = useUsers(fetchData);
  const [
    insertIouTransaction,
    updateIouTransaction,
    deleteIouTransaction,
    fetchTransactionsByID,
  ] = useIouTransactions(fetchData);

  const contextValue = {
    users,
    setUsers,
    fetchData,
    insertUser,
    updateUser,
    deleteUser,
    insertIouTransaction,
    updateIouTransaction,
    deleteIouTransaction,
    fetchTransactionsByID,
  };

  return (
    <DBContext.Provider value={contextValue}>{children}</DBContext.Provider>
  );
};

export const useDB = (): DBContextType => {
  const context = useContext(DBContext);
  if (!context) throw new Error("useDB must be used within a DBProvider");
  return context;
};
