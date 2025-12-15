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
import {
  useUsers,
  useIouTransactions,
  useBills,
  useBillTransactions,
} from "@/hooks/db";
import { billTable, usersTable } from "@/db/schema";
import { db } from "@/db";
import { Bill } from "@/types/bill";

type DBContextType = {
  users: User[];
  bills: Bill[];
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
  insertBill: (title: string, users: string) => Promise<boolean>;
  deleteBill: (id: number) => Promise<boolean>;
  updateBill: (id: number, title: string, users: string) => Promise<boolean>;
  insertBillTransaction: (
    billId: number,
    user: string,
    note: string | null,
    amount: number
  ) => Promise<boolean>;
  deleteBillTransaction: (id: number) => Promise<boolean>;
  updateBillTransaction: (
    id: number,
    note: string,
    amount: number
  ) => Promise<boolean>;
  fetchTransactionsByID: (id: number) => Promise<IOUTransaction[] | null>;
  getBillTransactions: (billId: number) => Promise<any[]>;
};

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  const fetchData = async (): Promise<void> => {
    try {
      const fetchedUsers: User[] = await db.select().from(usersTable).all();
      const fetchedBills: Bill[] = await db.select().from(billTable).all();
      setUsers(fetchedUsers);
      setBills(fetchedBills);
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
  const [insertBill, deleteBill, updateBill] = useBills(fetchData);
  const [insertBillTransaction, deleteBillTransaction, getBillTransactions, updateBillTransaction] =
    useBillTransactions(fetchData);

  const contextValue = {
    users,
    bills,
    setUsers,
    fetchData,
    insertUser,
    updateUser,
    deleteUser,
    insertIouTransaction,
    updateIouTransaction,
    deleteIouTransaction,
    insertBill,
    deleteBill,
    updateBill,
    insertBillTransaction,
    deleteBillTransaction,
    updateBillTransaction,
    fetchTransactionsByID,
    getBillTransactions,
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
