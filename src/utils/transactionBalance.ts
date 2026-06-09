import type { TransactionType } from "types/transactions";

export function getBalanceDelta(type: TransactionType, amount: number) {
  return type === "expense" ? -amount : amount;
}
