import type {
  DashboardAccountSummary,
  DashboardAmountSummary,
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

export function createDashboardAccountSummary(
  overrides: Partial<DashboardAccountSummary> = {},
): DashboardAccountSummary {
  return {
    balance: "2580",
    currency: "JPY",
    id: "00000000-0000-4000-8000-000000008001",
    name: "现金钱包",
    type: "cash",
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
    tagNames: [],
    transaction_at: "2026-06-05T03:20:10.000Z",
    type: "expense",
    ...overrides,
  };
}

export function createDashboardViewData(
  overrides: Partial<DashboardViewData> = {},
): DashboardViewData {
  return {
    accountSummaries: [
      createDashboardAccountSummary(),
      createDashboardAccountSummary({
        balance: "12450",
        id: "00000000-0000-4000-8000-000000008002",
        name: "招商银行信用卡",
        type: "credit_card",
      }),
      createDashboardAccountSummary({
        balance: "8760",
        id: "00000000-0000-4000-8000-000000008003",
        name: "支付宝",
        type: "e_money",
      }),
      createDashboardAccountSummary({
        balance: "28030",
        id: "00000000-0000-4000-8000-000000008004",
        name: "微信钱包",
        type: "e_money",
      }),
      createDashboardAccountSummary({
        balance: "5000",
        id: "00000000-0000-4000-8000-000000008005",
        name: "日本银行卡",
        type: "bank",
      }),
    ],
    monthLabel: "2026年6月",
    monthSummary: createDashboardAmountSummary(),
    recentTransactions: [],
    ...overrides,
  };
}
