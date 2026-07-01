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
  { id: "food", name: "饮食", parent_id: null, type: "expense" },
  { id: "salary", name: "收入", parent_id: null, type: "income" },
  { id: "dinner", name: "晚餐", parent_id: "food", type: "expense" },
  { id: "bonus", name: "奖金", parent_id: "salary", type: "income" },
];

const merchants = [
  { id: "merchant-a", name: "便利店" },
  { id: "merchant-b", name: "公司" },
];

const recorders: AppUserSummaryDbRow[] = [
  { display_name: "淞文", id: "user-a" },
  { display_name: "家庭成员", id: "user-b" },
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
    type: "normal",
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
          category_id: null,
          transaction_record_id: "transfer",
        }),
        item({
          amount: "500",
          category_id: "bonus",
          transaction_record_id: "july",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 1,
      records: [
        record({ id: "june", transaction_at: "2026-06-28T10:00:00.000Z" }),
        record({
          id: "transfer",
          transaction_at: "2026-07-01T08:00:00.000Z",
          type: "transfer",
        }),
        record({
          id: "july",
          transaction_at: "2026-07-02T10:00:00.000Z",
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

  it("支持季度和周时间分组", () => {
    const commonParams = {
      accounts,
      categories,
      currency: "JPY",
      items: [item({ amount: "120", transaction_record_id: "time-group" })],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "time-group",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    };

    const quarterResult = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "quarter",
    });
    const weekResult = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "week",
    });

    expect(quarterResult.groups[0]).toMatchObject({
      id: "quarter:2026-Q2",
      key: "2026-Q2",
      label: "2026年第2季度",
    });
    expect(weekResult.groups[0]).toMatchObject({
      id: "week:2026-06-22",
      key: "2026-06-22",
      label: "2026年6月22日周",
    });
  });

  it("按商家分组时用整笔流水净额计算收入和支出", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "merchant",
      items: [
        item({ amount: "100", transaction_record_id: "mixed" }),
        item({
          amount: "300",
          category_id: "bonus",
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
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups).toEqual([
      {
        id: "merchant:merchant-b",
        key: "merchant-b",
        label: "公司",
        summary: {
          balance: "200",
          currency: "JPY",
          expense: "0",
          income: "200",
        },
        transactionCount: 1,
      },
    ]);
  });

  it("混合收支净额为负数时按支出统计", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "merchant",
      items: [
        item({ amount: "300", transaction_record_id: "negative-mixed" }),
        item({
          amount: "100",
          category_id: "bonus",
          transaction_record_id: "negative-mixed",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "negative-mixed",
          merchant_id: "merchant-b",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups[0]).toMatchObject({
      summary: {
        balance: "-200",
        currency: "JPY",
        expense: "200",
        income: "0",
      },
    });
  });

  it("普通明细方向按 category.type 处理", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "merchant",
      items: [
        item({ amount: "300", transaction_record_id: "category-type" }),
        item({
          amount: "80",
          category_id: "bonus",
          transaction_record_id: "category-type",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "category-type",
          merchant_id: "merchant-a",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups[0]).toMatchObject({
      summary: {
        balance: "-220",
        currency: "JPY",
        expense: "220",
        income: "0",
      },
    });
  });

  it("按成员分组时按记录人统计整笔流水", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "member",
      items: [
        item({ amount: "120", transaction_record_id: "user-a-expense" }),
        item({
          amount: "500",
          category_id: "bonus",
          transaction_record_id: "user-b-income",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          created_by: "user-a",
          id: "user-a-expense",
          transaction_at: "2026-06-27T10:00:00.000Z",
        }),
        record({
          created_by: "user-b",
          id: "user-b-income",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups).toEqual([
      {
        id: "member:user-b",
        key: "user-b",
        label: "家庭成员",
        summary: {
          balance: "500",
          currency: "JPY",
          expense: "0",
          income: "500",
        },
        transactionCount: 1,
      },
      {
        id: "member:user-a",
        key: "user-a",
        label: "淞文",
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

  it("按账户分组时按明细所在账户分别统计", () => {
    const result = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "account",
      items: [
        item({
          account_id: "account-cash",
          amount: "100",
          transaction_record_id: "mixed",
        }),
        item({
          account_id: "account-bank",
          amount: "300",
          category_id: "bonus",
          transaction_record_id: "mixed",
        }),
      ],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "mixed",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    });

    expect(result.groups).toHaveLength(2);
    expect(result.groups).toEqual(
      expect.arrayContaining([
        {
          id: "account:account-bank",
          key: "account-bank",
          label: "银行",
          summary: {
            balance: "300",
            currency: "JPY",
            expense: "0",
            income: "300",
          },
          transactionCount: 1,
        },
        {
          id: "account:account-cash",
          key: "account-cash",
          label: "现金",
          summary: {
            balance: "-100",
            currency: "JPY",
            expense: "100",
            income: "0",
          },
          transactionCount: 1,
        },
      ]),
    );
  });

  it("按大分类和小分类分组时返回分类维度的大 item 统计", () => {
    const commonParams = {
      accounts,
      categories,
      currency: "JPY",
      items: [item({ amount: "120", transaction_record_id: "dinner" })],
      merchants,
      offset: 0,
      pageSize: 20,
      records: [
        record({
          id: "dinner",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
      ],
      recorders,
      tagAssignments: [],
    };

    const parentCategoryResult = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "parentCategory",
    });
    const categoryResult = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "category",
    });

    expect(parentCategoryResult.groups[0]).toMatchObject({
      id: "parentCategory:food",
      label: "饮食",
      summary: { balance: "-120", expense: "120", income: "0" },
    });
    expect(categoryResult.groups[0]).toMatchObject({
      id: "category:dinner",
      label: "晚餐",
      summary: { balance: "-120", expense: "120", income: "0" },
    });
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
      records: [
        record({
          id: "daily",
          transaction_at: "2026-06-28T10:00:00.000Z",
        }),
        record({
          id: "untagged",
          transaction_at: "2026-06-27T10:00:00.000Z",
        }),
      ],
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

  it("按月分组时以 Asia/Tokyo 时区日期归入月份", () => {
    const commonParams = {
      accounts,
      categories,
      currency: "JPY",
      merchants,
      offset: 0,
      pageSize: 20,
      recorders,
      tagAssignments: [],
    };

    // 2026-06-30T15:30:00Z = 2026-07-01T00:30:00+09:00 → 应归入 2026-07
    const result1 = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "month",
      items: [item({ amount: "100", transaction_record_id: "tz-july" })],
      records: [
        record({
          id: "tz-july",
          transaction_at: "2026-06-30T15:30:00.000Z",
        }),
      ],
    });

    expect(result1.groups).toHaveLength(1);
    expect(result1.groups[0]).toMatchObject({
      id: "month:2026-07",
      key: "2026-07",
      label: "2026年7月",
    });

    // 2026-06-30T14:59:59Z = 2026-06-30T23:59:59+09:00 → 应归入 2026-06
    const result2 = buildTransactionGroupSummaryPage({
      ...commonParams,
      groupBy: "month",
      items: [item({ amount: "100", transaction_record_id: "tz-june" })],
      records: [
        record({
          id: "tz-june",
          transaction_at: "2026-06-30T14:59:59.000Z",
        }),
      ],
    });

    expect(result2.groups).toHaveLength(1);
    expect(result2.groups[0]).toMatchObject({
      id: "month:2026-06",
      key: "2026-06",
      label: "2026年6月",
    });
  });

  it("大 item 统计来自完整传入数据，不依赖小 item 分页加载数量", () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...item({ amount: "100", transaction_record_id: `r${i}` }),
    }));
    const manyRecords = Array.from({ length: 25 }, (_, i) =>
      record({ id: `r${i}`, transaction_at: "2026-06-15T10:00:00.000Z" }),
    );

    const fullResult = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items: manyItems,
      merchants,
      offset: 0,
      pageSize: 20,
      records: manyRecords,
      recorders,
      tagAssignments: [],
    });

    // 全 25 笔都在同一个月，summary 应基于全部数据，与 pageSize 无关
    expect(fullResult.groups).toHaveLength(1);
    expect(fullResult.groups[0]).toMatchObject({
      summary: {
        balance: "-2500",
        expense: "2500",
        income: "0",
      },
      transactionCount: 25,
    });
  });
});
