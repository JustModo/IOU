import {
  createContext,
  ReactNode,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";
import { TransactionType } from "@/types/utils";
import * as userSvc from "@/services/userService";
import * as txSvc from "@/services/transactionService";

type DBContextType = {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  fetchData: () => Promise<void>;
  insertUser: (name: string, pfp: string | null, upiId: string | null) => Promise<boolean>;
  updateUser: (
    id: number,
    name: string,
    pfp: string | null,
    upiId: string | null
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
      const fetched = await userSvc.getAllUsers();
      setUsers(fetched);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const insertUser = async (
    name: string,
    pfp: string | null,
    upiId: string | null
  ): Promise<boolean> => {
    try {
      await userSvc.insertUser(name, pfp, upiId);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error inserting user:", error);
      return false;
    }
  };

  const updateUser = async (
    id: number,
    name: string,
    pfp: string | null,
    upiId: string | null
  ): Promise<boolean> => {
    try {
      await userSvc.updateUser(id, name, pfp, upiId);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await userSvc.deleteUser(id);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };


  const insertIouTransaction = async (
    userId: number,
    note: string,
    amount: number,
    type: TransactionType
  ): Promise<boolean> => {
    try {
      await txSvc.insertTransaction(userId, note, amount, type);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error inserting IOU transaction:", error);
      return false;
    }
  };

  const updateIouTransaction = async (
    transactionId: number,
    note: string,
    newAmount: number,
    type: TransactionType
  ): Promise<boolean> => {
    try {
      await txSvc.updateTransaction(transactionId, note, newAmount, type);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error updating IOU transaction:", error);
      return false;
    }
  };

  const deleteIouTransaction = async (id: number): Promise<boolean> => {
    try {
      await txSvc.deleteTransaction(id);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error deleting IOU transaction:", error);
      return false;
    }
  };

  const fetchTransactionsByID = async (
    id: number
  ): Promise<IOUTransaction[] | null> => {
    try {
      return await txSvc.getTransactionsByUserId(id);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  };

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
