import { describe, expect, it } from "vitest";

import { buildTransactionListItem } from "./buildTransactionListItem";

const baseRecord = {
  created_at: "2026-06-22T10:00:00.000Z",
  id: "record-001",
  merchant_id: null,
  note: null,
  transaction_at: "2026-06-22T10:00:00.000Z",
  type: "transfer" as const,
};

const accountA = { currency: "JPY", id: "acct-a", name: "日元现金" };
const accountB = { currency: "JPY", id: "acct-b", name: "储蓄账户" };
const categoryA = { id: "cat-a", name: "餐饮", parent_id: null };
const categoryB = { id: "cat-b", name: "工资", parent_id: null };
const accountById = new Map([
  [accountA.id, accountA],
  [accountB.id, accountB],
]);
const categoryById = new Map([
  [categoryA.id, categoryA],
  [categoryB.id, categoryB],
]);

describe("buildTransactionListItem", () => {
  it("转账构建转出→转入账户名称", () => {
    const item = buildTransactionListItem({
      accountById,
      categoryById: new Map(),
      fallbackCurrency: "JPY",
      merchantById: new Map(),
      record: baseRecord,
      recordItems: [
        {
          account_id: accountA.id,
          amount: "5000",
          balance_delta: "-5000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
        {
          account_id: accountB.id,
          amount: "5000",
          balance_delta: "5000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.account_name).toBe("日元现金 → 储蓄账户");
    expect(item.type).toBe("transfer");
  });

  it("转账 categoryItems 为空数组", () => {
    const item = buildTransactionListItem({
      accountById,
      categoryById: new Map(),
      fallbackCurrency: "JPY",
      merchantById: new Map(),
      record: baseRecord,
      recordItems: [
        {
          account_id: accountA.id,
          amount: "5000",
          balance_delta: "-5000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
        {
          account_id: accountB.id,
          amount: "5000",
          balance_delta: "5000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.categoryItems).toEqual([]);
    expect(item.merchant_name).toBeNull();
    expect(item.merchant_icon_url).toBeNull();
  });

  it("转账金额取转出明细的 amount", () => {
    const item = buildTransactionListItem({
      accountById,
      categoryById: new Map(),
      fallbackCurrency: "JPY",
      merchantById: new Map(),
      record: baseRecord,
      recordItems: [
        {
          account_id: accountA.id,
          amount: "3000",
          balance_delta: "-3000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
        {
          account_id: accountB.id,
          amount: "3000",
          balance_delta: "3000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.amount).toBe("3000");
  });

  it("转账明细结构异常时不崩溃（无 balance_delta）", () => {
    const item = buildTransactionListItem({
      accountById,
      categoryById: new Map(),
      fallbackCurrency: "JPY",
      merchantById: new Map(),
      record: baseRecord,
      recordItems: [
        {
          account_id: accountA.id,
          amount: "2000",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.type).toBe("transfer");
    expect(item.amount).toBe("2000");
  });

  it("支出记录仍按原逻辑构建", () => {
    const merchantId = "merchant-001";
    const item = buildTransactionListItem({
      accountById,
      categoryById: new Map(),
      fallbackCurrency: "JPY",
      merchantById: new Map([
        [merchantId, { icon_url: null, id: merchantId, name: "便利店" }],
      ]),
      record: {
        ...baseRecord,
        merchant_id: merchantId,
        type: "expense" as const,
      },
      recordItems: [
        {
          account_id: accountA.id,
          amount: "1200",
          category_id: null,
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.type).toBe("expense");
    expect(item.merchant_name).toBe("便利店");
    expect(item.account_name).toBe("日元现金");
    expect(item.amount).toBe("1200");
  });

  it("分类摘要保留 stat_type 并按净额构建金额和展示方向", () => {
    const item = buildTransactionListItem({
      accountById,
      categoryById,
      fallbackCurrency: "JPY",
      merchantById: new Map(),
      record: {
        ...baseRecord,
        type: "expense" as const,
      },
      recordItems: [
        {
          account_id: accountA.id,
          amount: "1200",
          category_id: categoryA.id,
          stat_type: "expense",
          transaction_record_id: baseRecord.id,
        },
        {
          account_id: accountA.id,
          amount: "260000",
          category_id: categoryB.id,
          stat_type: "income",
          transaction_record_id: baseRecord.id,
        },
      ],
    });

    expect(item.type).toBe("income");
    expect(item.amount).toBe("258800");
    expect(item.categoryItems).toEqual([
      {
        amount: "1200",
        categoryName: "餐饮",
        parentCategoryName: null,
        statType: "expense",
      },
      {
        amount: "260000",
        categoryName: "工资",
        parentCategoryName: null,
        statType: "income",
      },
    ]);
  });
});
