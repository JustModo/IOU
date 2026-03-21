import { TransactionType } from "@/types/utils";

export const TRANSACTION_TYPE_MAP: Record<
  TransactionType,
  { title: string; mul: number }
> = {
  oweme: { title: "Lent", mul: 1 },
  oweyou: { title: "Borrowed", mul: -1 },
  repay: { title: "Got Back", mul: 1 },
  repaid: { title: "Paid Back", mul: -1 },
};

export function normalizeTransactionAmount(amount: number, type: TransactionType): number {
  return amount * TRANSACTION_TYPE_MAP[type].mul;
}
