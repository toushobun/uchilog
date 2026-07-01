import type {
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionListItem,
  TransactionMonthViewData,
} from "types/transactions";

export function createTransactionListItem(
  overrides: Partial<TransactionListItem> = {},
): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: "日元现金",
    amount: "1234",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    created_at: "2026-05-29T03:20:10.000Z",
    id: "00000000-0000-4000-8000-000000009001",
    merchant_icon_url: null,
    merchant_name: "便利店",
    note: "测试备注",
    recorder_name: null,
    tagNames: [],
    transaction_at: "2026-05-29T03:20:10.000Z",
    type: "expense",
    ...overrides,
  };
}

function summarizeItems(
  items: TransactionListItem[],
): TransactionAmountSummary {
  const income = items
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = items
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    balance: String(income - expense),
    currency: "JPY",
    expense: String(expense),
    income: String(income),
  };
}

export function createTransactionDateGroup({
  date = "2026-05-29",
  items = [createTransactionListItem()],
  label = "29日（周五）",
  summary,
}: {
  date?: string;
  items?: TransactionListItem[];
  label?: string;
  summary?: TransactionAmountSummary;
} = {}): TransactionDateGroup {
  return {
    date,
    items,
    label,
    summary: summary ?? summarizeItems(items),
  };
}

export function createTransactionMonthView(
  overrides: Partial<TransactionMonthViewData> = {},
): TransactionMonthViewData {
  return {
    groups: [createTransactionDateGroup()],
    month: "2026-05",
    monthLabel: "2026年5月",
    nextMonth: "2026-06",
    previousMonth: "2026-04",
    nextOffset: null,
    ...overrides,
  };
}
