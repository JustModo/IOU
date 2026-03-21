import { TransactionType } from "@/types/utils";

export const TRANSACTION_TYPE_MAP: Record<
  TransactionType,
  { title: string; mul: number }
> = {
  oweme: { title: "You Owe Me", mul: 1 },
  oweyou: { title: "I Owe You", mul: -1 },
  repay: { title: "Repay", mul: 1 },
};

export function normalizeTransactionAmount(amount: number, type: TransactionType): number {
  return amount * TRANSACTION_TYPE_MAP[type].mul;
}
