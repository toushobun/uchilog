export const transactionTypeOptions = [
  { label: "支出", value: "expense" },
  { label: "收入", value: "income" },
] as const;

export type TransactionType = (typeof transactionTypeOptions)[number]["value"];
export type TransactionRecordType = TransactionType | "transfer";
// 分类类型目前只对应支出 / 收入，用语义别名和包含 transfer 的交易记录类型区分。
export type TransactionCategoryType = TransactionType;

export type CategorySummaryItem = {
  categoryName: string;
  parentCategoryName: string | null;
  amount: string;
};

export type TransactionRowItem = {
  id: string;
  type: TransactionRecordType;
  transaction_at: string;
  amount: string;
  account_name: string;
  account_currency: string;
  categoryItems: CategorySummaryItem[];
  merchant_name: string | null;
  merchant_icon_url: string | null;
  note?: string | null;
  recorder_name?: string | null;
};

export type TransactionAccountOption = {
  id: string;
  name: string;
  currency: string;
};

export type TransactionCategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  type: TransactionCategoryType;
};

export type TransactionMerchantOption = {
  id: string;
  name: string;
  icon_url: string | null;
};

export type TransactionTagOption = {
  id: string;
  name: string;
  color: string | null;
};

export type TransactionListItem = TransactionRowItem & {
  note: string | null;
  recorder_name: string | null;
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

export type TransactionMonthViewData = {
  month: string;
  monthLabel: string;
  previousMonth: string;
  nextMonth: string;
  summary: TransactionAmountSummary;
  groups: TransactionDateGroup[];
  nextOffset: number | null;
};

export type TransactionMonthView = TransactionMonthViewData;

export type TransactionMonthPage = {
  groups: TransactionDateGroup[];
  nextOffset: number | null;
};

export type TransactionListPage = {
  items: TransactionListItem[];
  nextOffset: number | null;
};
