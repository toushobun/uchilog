import type {
  DashboardAmountSummary,
  DashboardPeriodExpense,
  DashboardRecentTransaction,
  DashboardViewData,
} from "types/dashboard";

export function createDashboardAmountSummary(
  overrides: Partial<DashboardAmountSummary> = {},
): DashboardAmountSummary {
  return {
    balance: "180000",
    currency: "JPY",
    expense: "80000",
    income: "260000",
    ...overrides,
  };
}

export function createDashboardPeriodExpense(
  overrides: Partial<DashboardPeriodExpense> = {},
): DashboardPeriodExpense {
  return {
    currency: "JPY",
    expense: "331",
    recordCount: 2,
    ...overrides,
  };
}

export function createDashboardRecentTransaction(
  overrides: Partial<DashboardRecentTransaction> = {},
): DashboardRecentTransaction {
  return {
    account_currency: "JPY",
    account_name: "日元现金",
    amount: "1234",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    id: "00000000-0000-4000-8000-000000009001",
    merchant_icon_url: null,
    merchant_name: "便利店",
    note: "测试备注",
    transaction_at: "2026-06-05T03:20:10.000Z",
    type: "expense",
    ...overrides,
  };
}

export function createDashboardViewData(
  overrides: Partial<DashboardViewData> = {},
): DashboardViewData {
  return {
    monthLabel: "2026年6月",
    monthSummary: createDashboardAmountSummary(),
    recentTransactions: [],
    todayExpense: createDashboardPeriodExpense(),
    weekExpense: createDashboardPeriodExpense({
      expense: "2840",
      recordCount: 8,
    }),
    ...overrides,
  };
}
