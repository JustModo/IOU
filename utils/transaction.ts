import { TransactionType } from "@/types/utils";

export const TRANSACTION_TYPE_MAP: Record<
  TransactionType,
  { title: string; mul: number }
> = {
  oweme: { title: "Lend", mul: 1 },
  oweyou: { title: "Borrow", mul: -1 },
  repay: { title: "Collect", mul: -1 },
  repaid: { title: "Repay", mul: 1 },
};

export function normalizeTransactionAmount(amount: number, type: TransactionType): number {
  const result = amount * TRANSACTION_TYPE_MAP[type].mul;
  return Number(result.toFixed(2));
}
