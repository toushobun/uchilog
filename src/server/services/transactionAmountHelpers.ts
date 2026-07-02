import type {
  CategorySummaryDbRow,
  TransactionItemDbRow,
} from "server/db-types";
import type {
  TransactionAmountSummary,
  TransactionCategoryType,
} from "types/transactions";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
} from "utils/transactions";

export function getSignedTransactionItemAmount(
  item: TransactionItemDbRow,
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  return getSignedItemAmount(item, categoryById);
}

export function calculateTransactionRecordNetAmount(
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  return calculateRecordNetAmount(items, categoryById);
}

export function getTransactionRecordCategoryType(
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
): TransactionCategoryType {
  const summary = getTransactionRecordAmountProfile(items, categoryById);

  if (summary.netAmount > 0) return "income";
  if (summary.netAmount < 0) return "expense";
  if (summary.hasExpense) return "expense";
  if (summary.hasIncome) return "income";

  return "expense";
}

export function createSummary(currency: string): TransactionAmountSummary {
  return createTransactionAmountSummary(currency);
}

export function calculateRecordNetAmount(
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  return items.reduce(
    (sum, item) => sum + getSignedItemAmount(item, categoryById),
    0,
  );
}

export function addSignedAmount(
  summary: TransactionAmountSummary,
  amount: number,
) {
  if (!Number.isFinite(amount) || amount === 0) return;

  addTransactionAmount(
    summary,
    amount > 0 ? "income" : "expense",
    String(Math.abs(amount)),
  );
}

export function normalizeSummary(
  summary: TransactionAmountSummary,
): TransactionAmountSummary {
  return {
    balance: String(Number(summary.balance)),
    currency: summary.currency,
    expense: String(Number(summary.expense)),
    income: String(Number(summary.income)),
  };
}

function getTransactionRecordAmountProfile(
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  let expenseTotal = 0;
  let hasExpense = false;
  let hasIncome = false;
  let incomeTotal = 0;

  for (const item of items) {
    const categoryType = item.category_id
      ? categoryById.get(item.category_id)?.type
      : undefined;

    if (categoryType === "income") {
      hasIncome = true;
    } else if (categoryType === "expense") {
      hasExpense = true;
    }

    const amount = Number(item.amount);

    if (!Number.isFinite(amount)) continue;

    if (categoryType === "income") {
      incomeTotal += amount;
    } else if (categoryType === "expense") {
      expenseTotal += amount;
    }
  }

  return {
    expenseTotal,
    hasExpense,
    hasIncome,
    incomeTotal,
    netAmount: incomeTotal - expenseTotal,
  };
}

function getSignedItemAmount(
  item: TransactionItemDbRow,
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  const amount = Number(item.amount);

  if (!Number.isFinite(amount)) return 0;

  const categoryType = item.category_id
    ? categoryById.get(item.category_id)?.type
    : undefined;

  if (categoryType === "income") return amount;
  if (categoryType === "expense") return -amount;

  return 0;
}
