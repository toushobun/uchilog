import { describe, expect, it } from "vitest";

import { buildStatisticsViewData } from "./statistics";

const records = [
  {
    id: "expense-1",
    merchant_id: "merchant-super",
    type: "normal" as const,
  },
  {
    id: "expense-2",
    merchant_id: "merchant-cafe",
    type: "normal" as const,
  },
  {
    id: "expense-3",
    merchant_id: "merchant-missing",
    type: "normal" as const,
  },
  {
    id: "income-1",
    merchant_id: "merchant-company",
    type: "normal" as const,
  },
];

const items = [
  {
    amount: "1000",
    category_id: "category-food",
    transaction_record_id: "expense-1",
  },
  {
    amount: "600",
    category_id: "category-daily",
    transaction_record_id: "expense-1",
  },
  {
    amount: "1500",
    category_id: "category-food",
    transaction_record_id: "expense-2",
  },
  {
    amount: "300",
    category_id: null,
    transaction_record_id: "expense-3",
  },
  {
    amount: "250000",
    category_id: "category-salary",
    transaction_record_id: "income-1",
  },
  {
    amount: "999",
    category_id: "category-food",
    transaction_record_id: "missing-record",
  },
  {
    amount: "invalid",
    category_id: "category-food",
    transaction_record_id: "expense-2",
  },
];

const merchants = [
  { id: "merchant-super", name: "超市" },
  { id: "merchant-cafe", name: "咖啡店" },
  { id: "merchant-company", name: "公司" },
];

const categories = [
  {
    id: "category-parent-food",
    name: "食费",
    parent_id: null,
    type: "expense" as const,
  },
  {
    id: "category-food",
    name: "外食",
    parent_id: "category-parent-food",
    type: "expense" as const,
  },
  {
    id: "category-daily",
    name: "日用品",
    parent_id: null,
    type: "expense" as const,
  },
  {
    id: "category-salary",
    name: "工资",
    parent_id: null,
    type: "income" as const,
  },
];

describe("statistics utils", () => {
  it("按月份交易生成基础汇总和支出排行榜", () => {
    const view = buildStatisticsViewData({
      categories,
      currency: "JPY",
      items,
      ledgerName: "家庭账本",
      merchants,
      month: "2026-06",
      records,
    });

    expect(view).toMatchObject({
      ledgerName: "家庭账本",
      month: "2026-06",
      monthLabel: "2026年6月",
      nextMonth: "2026-07",
      previousMonth: "2026-05",
      summary: {
        balance: "246900",
        currency: "JPY",
        expense: "3100",
        income: "250000",
      },
    });
    expect(view.merchantExpenseRanking).toEqual([
      {
        amount: "1600",
        id: "merchant-super",
        name: "超市",
        transactionCount: 1,
      },
      {
        amount: "1500",
        id: "merchant-cafe",
        name: "咖啡店",
        transactionCount: 1,
      },
    ]);
    expect(view.categoryExpenseRanking).toEqual([
      {
        amount: "2500",
        id: "category-food",
        name: "食费 / 外食",
        transactionCount: 2,
      },
      {
        amount: "600",
        id: "category-daily",
        name: "日用品",
        transactionCount: 1,
      },
    ]);
  });

  it("没有交易数据时返回空汇总", () => {
    const view = buildStatisticsViewData({
      categories: [],
      currency: "JPY",
      items: [],
      ledgerName: "家庭账本",
      merchants: [],
      month: "2026-07",
      records: [],
    });

    expect(view.summary).toEqual({
      balance: "0",
      currency: "JPY",
      expense: "0",
      income: "0",
    });
    expect(view.merchantExpenseRanking).toEqual([]);
    expect(view.categoryExpenseRanking).toEqual([]);
  });
});
