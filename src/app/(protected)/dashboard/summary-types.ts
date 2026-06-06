export type DashboardAmountSummary = {
  income: string;
  expense: string;
  balance: string;
  currency: string;
};

export type DashboardAccountSummary = {
  accountCount: number;
  totalBalance: string;
  currency: string;
};

export type DashboardRecentTransaction = {
  id: string;
  type: "expense" | "income";
  transaction_at: string;
  amount: string;
  account_name: string;
  account_currency: string;
  category_name: string | null;
  merchant_name: string | null;
  merchant_icon_url: string | null;
};

export type DashboardPeriodExpense = {
  expense: string;
  currency: string;
  count: number;
};

export type DashboardViewData = {
  ledgerName: string;
  monthLabel: string;
  monthSummary: DashboardAmountSummary;
  accountSummary: DashboardAccountSummary;
  recentTransactions: DashboardRecentTransaction[];
  todayExpense: DashboardPeriodExpense;
  weekExpense: DashboardPeriodExpense;
};
