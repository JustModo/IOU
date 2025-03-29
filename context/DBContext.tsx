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
import { usersTable } from "@/db/schema";
import { db } from "@/db";

type DBContextType = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  fetchUsers: () => Promise<void>;
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
  const [loaded, setLoaded] = useState(false);

  const fetchUsers = async (): Promise<void> => {
    try {
      if (!loaded) return;
      const result: User[] = await db.select().from(usersTable).all();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!loaded || users.length > 0) return;
    fetchUsers();
  }, [loaded]);

  const [insertUser, updateUser, deleteUser] = useUsers(fetchUsers);
  const [
    insertIouTransaction,
    updateIouTransaction,
    deleteIouTransaction,
    fetchTransactionsByID,
  ] = useIouTransactions(fetchUsers);
  const [insertBill, deleteBill] = useBills(fetchUsers);
  const [insertBillTransaction, deleteBillTransaction] =
    useBillTransactions(fetchUsers);

  return (
    <DBContext.Provider
      value={{
        users,
        setUsers,
        setLoaded,
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
