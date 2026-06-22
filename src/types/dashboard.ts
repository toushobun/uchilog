import type {
  CategorySummaryItem,
  TransactionRecordType,
} from "types/transactions";

export type DashboardAmountSummary = {
  income: string;
  expense: string;
  balance: string;
  currency: string;
};

export type DashboardRecentTransaction = {
  id: string;
  type: TransactionRecordType;
  transaction_at: string;
  amount: string;
  account_name: string;
  account_currency: string;
  categoryItems: CategorySummaryItem[];
  merchant_name: string | null;
  merchant_icon_url: string | null;
  note: string | null;
};

export type DashboardPeriodExpense = {
  expense: string;
  currency: string;
  recordCount: number;
};

export type DashboardViewData = {
  monthLabel: string;
  monthSummary: DashboardAmountSummary;
  recentTransactions: DashboardRecentTransaction[];
  todayExpense: DashboardPeriodExpense;
  weekExpense: DashboardPeriodExpense;
};
