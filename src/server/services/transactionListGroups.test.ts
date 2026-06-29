import { describe, expect, it } from "vitest";

import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";

import { buildTransactionGroupSummaryPage } from "./transactionListGroups";

const accounts: AccountOptionDbRow[] = [
  { currency: "JPY", id: "account-cash", name: "现金" },
  { currency: "JPY", id: "account-bank", name: "银行" },
];

const categories: CategorySummaryDbRow[] = [
  { id: "food", name: "饮食", parent_id: null },
  { id: "salary", name: "收入", parent_id: null },
  { id: "dinner", name: "晚餐", parent_id: "food" },
  { id: "bonus", name: "奖金", parent_id: "salary" },
];

const merchants = [
  { id: "merchant-a", name: "便利店" },
  { id: "merchant-b", name: "公司" },
];

const recorders: AppUserSummaryDbRow[] = [
  { display_name: "淞文", id: "user-a" },
];

function record(
  value: Partial<TransactionRecordDbRow> & Pick<TransactionRecordDbRow, "id">,
): TransactionRecordDbRow {
  return {
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: "user-a",
    merchant_id: "merchant-a",
    note: null,
    transaction_at: "2026-06-01T00:00:00.000Z",
    type: "expense",
    ...value,
  };
}

function item(
  value: Partial<TransactionItemDbRow> &
    Pick<TransactionItemDbRow, "transaction_record_id">,
): TransactionItemDbRow {
  return {
    account_id: "account-cash",
    amount: "0",
    balance_delta: "0",
    category_id: "dinner",
    note: null,
    stat_type: "expense",
    ...value,
  };
}

describe("transactionListGroups", () => {
  it("按月分组时按记账发生时间倒序分页，并且转账不参与统计", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items: [
        item({ amount: "120", transaction_record_id: "june" }),
        item({
          amount: "300",
          stat_type: "transfer",
          transaction_record_id: "transfer",
        }),
        item({
          amount: "500",
          stat_type: "income",
          transaction_record_id: "july",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 1,
      records: [
        record({
          id: "june",
          transaction_at: "2026-06-15T00:00:00.000Z",
        }),
        record({
          id: "transfer",
          transaction_at: "2026-07-10T00:00:00.000Z",
          type: "transfer",
        }),
        record({
          id: "july",
          transaction_at: "2026-07-20T00:00:00.000Z",
          type: "income",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.nextOffset).toBe(1);
    expect(result.groups).toEqual([
      {
        id: "month:2026-07",
        key: "2026-07",
        label: "2026年7月",
        summary: {
          balance: "500",
          currency: "JPY",
          expense: "0",
          income: "500",
        },
        transactionCount: 2,
      },
    ]);
  });

  it("普通记账混合支出和收入明细时按净额统计", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "merchant",
      items: [
        item({ amount: "300", transaction_record_id: "mixed" }),
        item({
          amount: "1000",
          category_id: "bonus",
          stat_type: "income",
          transaction_record_id: "mixed",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "mixed",
          merchant_id: "merchant-b",
          type: "income",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups[0]).toMatchObject({
      key: "merchant-b",
      label: "公司",
      summary: {
        balance: "700",
        currency: "JPY",
        expense: "0",
        income: "700",
      },
      transactionCount: 1,
    });
  });

  it("按账户分组时按明细粒度统计各账户金额", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "account",
      items: [
        item({
          account_id: "account-cash",
          amount: "120",
          transaction_record_id: "cash-expense",
        }),
        item({
          account_id: "account-bank",
          amount: "800",
          category_id: "bonus",
          stat_type: "income",
          transaction_record_id: "bank-income",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "cash-expense",
          transaction_at: "2026-06-01T00:00:00.000Z",
        }),
        record({
          id: "bank-income",
          transaction_at: "2026-06-02T00:00:00.000Z",
          type: "income",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups).toEqual([
      {
        id: "account:account-bank",
        key: "account-bank",
        label: "银行",
        summary: {
          balance: "800",
          currency: "JPY",
          expense: "0",
          income: "800",
        },
        transactionCount: 1,
      },
      {
        id: "account:account-cash",
        key: "account-cash",
        label: "现金",
        summary: {
          balance: "-120",
          currency: "JPY",
          expense: "120",
          income: "0",
        },
        transactionCount: 1,
      },
    ]);
  });

  it("按大分类和小分类分组时返回对应分类统计", () => {
    const params = {
      accounts,
      categories,
      currency: "JPY",
      items: [
        item({ amount: "120", transaction_record_id: "expense" }),
        item({
          amount: "800",
          category_id: "bonus",
          stat_type: "income",
          transaction_record_id: "income",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({ id: "expense" }),
        record({ id: "income", type: "income" }),
      ],
      recorders,
      tagAssignments: [],
    };

    expect(
      buildTransactionGroupSummaryPage({ ...params, groupBy: "parentCategory" })
        .groups,
    ).toEqual([
      {
        id: "parentCategory:food",
        key: "food",
        label: "饮食",
        summary: {
          balance: "-120",
          currency: "JPY",
          expense: "120",
          income: "0",
        },
        transactionCount: 1,
      },
      {
        id: "parentCategory:salary",
        key: "salary",
        label: "收入",
        summary: {
          balance: "800",
          currency: "JPY",
          expense: "0",
          income: "800",
        },
        transactionCount: 1,
      },
    ]);

    expect(
      buildTransactionGroupSummaryPage({ ...params, groupBy: "category" })
        .groups,
    ).toEqual([
      {
        id: "category:dinner",
        key: "dinner",
        label: "晚餐",
        summary: {
          balance: "-120",
          currency: "JPY",
          expense: "120",
          income: "0",
        },
        transactionCount: 1,
      },
      {
        id: "category:bonus",
        key: "bonus",
        label: "奖金",
        summary: {
          balance: "800",
          currency: "JPY",
          expense: "0",
          income: "800",
        },
        transactionCount: 1,
      },
    ]);
  });

  it("按标签分组时未打标签记录进入无标签分组", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "tag",
      items: [
        item({ amount: "120", transaction_record_id: "daily" }),
        item({ amount: "30", transaction_record_id: "untagged" }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [record({ id: "daily" }), record({ id: "untagged" })],
      recorders,
      tagAssignments: [
        {
          tagId: "tag-daily",
          tagName: "日常",
          transactionRecordId: "daily",
        },
      ],
    });

    expect(result.groups.map((group) => group.label)).toEqual([
      "日常",
      "无标签",
    ]);
  });
});
