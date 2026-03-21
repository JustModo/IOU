import { TransactionType } from "@/types/utils";

/**
 * Mapping from transaction type to display title and amount multiplier.
 */
export const TRANSACTION_TYPE_MAP: Record<
  TransactionType,
  { title: string; mul: number }
> = {
  oweme: { title: "You Owe Me", mul: 1 },
  oweyou: { title: "I Owe You", mul: -1 },
  repay: { title: "Repay", mul: 1 },
};

/**
 * Apply the sign multiplier for a given transaction type.
 */
export function normalizeTransactionAmount(
  amount: number,
  type: TransactionType
): number {
  return amount * TRANSACTION_TYPE_MAP[type].mul;
}
