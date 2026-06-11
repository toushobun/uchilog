import type { TransactionDateGroup } from "types/transactions";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
} from "utils/transactions";

export function mergeTransactionDateGroups(
  existing: TransactionDateGroup[],
  incoming: TransactionDateGroup[],
): TransactionDateGroup[] {
  const map = new Map(existing.map((group) => [group.date, group]));

  for (const group of incoming) {
    const prev = map.get(group.date);

    if (!prev) {
      map.set(group.date, group);
      continue;
    }

    const existingItemIds = new Set(prev.items.map((item) => item.id));
    const newItems = group.items.filter(
      (item) => !existingItemIds.has(item.id),
    );

    if (newItems.length === 0) {
      continue;
    }

    const addedSummary = createTransactionAmountSummary(prev.summary.currency);

    for (const item of newItems) {
      addTransactionAmount(addedSummary, item.type, item.amount);
    }

    map.set(group.date, {
      ...prev,
      items: [...prev.items, ...newItems],
      summary: {
        balance: String(
          Number(prev.summary.balance) + Number(addedSummary.balance),
        ),
        currency: prev.summary.currency,
        expense: String(
          Number(prev.summary.expense) + Number(addedSummary.expense),
        ),
        income: String(
          Number(prev.summary.income) + Number(addedSummary.income),
        ),
      },
    });
  }

  return [...map.values()];
}
