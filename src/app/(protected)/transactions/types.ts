export const transactionTypeOptions = [
  { label: "支出", value: "expense" },
  { label: "收入", value: "income" },
] as const;

export type TransactionType = (typeof transactionTypeOptions)[number]["value"];

export type TransactionAccountOption = {
  id: string;
  name: string;
  currency: string;
};

export type TransactionCategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
};

export type TransactionMerchantOption = {
  id: string;
  name: string;
  icon_url: string | null;
};

export type TransactionListItem = {
  id: string;
  type: TransactionType;
  transaction_at: string;
  amount: string;
  account_name: string;
  account_currency: string;
  category_name: string | null;
  merchant_name: string | null;
  merchant_icon_url: string | null;
  note: string | null;
  created_at: string;
};

export type TransactionAmountSummary = {
  income: string;
  expense: string;
  balance: string;
  currency: string;
};

export type TransactionDateGroup = {
  date: string;
  label: string;
  summary: TransactionAmountSummary;
  items: TransactionListItem[];
};

export type TransactionMonthView = {
  month: string;
  monthLabel: string;
  previousMonth: string;
  nextMonth: string;
  summary: TransactionAmountSummary;
  groups: TransactionDateGroup[];
  nextOffset: number | null;
};

export type TransactionMonthPage = {
  groups: TransactionDateGroup[];
  nextOffset: number | null;
};

export type TransactionListPage = {
  items: TransactionListItem[];
  nextOffset: number | null;
};
