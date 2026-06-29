import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentLedgerOrRedirect: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerOrRedirect: mocks.getCurrentLedgerOrRedirect,
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  buildCategoryOptions,
  loadEditTransactionView,
} from "./transactionForm";

const parentId = "00000000-0000-4000-8000-000000005001";
const childId1 = "00000000-0000-4000-8000-000000005072";
const childId2 = "00000000-0000-4000-8000-000000005073";
const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const merchantId = "00000000-0000-4000-8000-000000001001";
const tagId = "00000000-0000-4000-8000-000000003001";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";

type QueryResult = {
  data: unknown[] | null;
  error: unknown;
};

type QueryResults = Record<string, QueryResult | QueryResult[]>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentLedgerOrRedirect.mockResolvedValue({
    id: ledgerId,
    name: "家庭账本",
  });
});

function createQuery(result: QueryResult) {
  const query = {
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    is: vi.fn(() => query),
    limit: vi.fn(() => query),
    order: vi.fn(() => query),
    select: vi.fn(() => query),
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return query;
}

function setupSupabase(results: QueryResults) {
  const queues = new Map(
    Object.entries(results).map(([table, result]) => [
      table,
      Array.isArray(result) ? [...result] : [result],
    ]),
  );
  const from = vi.fn((table: string) => {
    const result = queues.get(table)?.shift() ?? { data: [], error: null };

    return createQuery(result);
  });

  mocks.createClient.mockResolvedValue({ from });

  return { from };
}

function setupEditViewData(overrides: QueryResults = {}) {
  return setupSupabase({
    account: {
      data: [{ currency: "JPY", id: accountId, name: "日元现金" }],
      error: null,
    },
    category: {
      data: [
        {
          id: parentId,
          name: "餐饮",
          parent_id: null,
          type: "expense",
        },
        {
          id: childId1,
          name: "午餐",
          parent_id: parentId,
          type: "expense",
        },
        {
          id: childId2,
          name: "交通",
          parent_id: parentId,
          type: "expense",
        },
      ],
      error: null,
    },
    merchant: {
      data: [{ icon_url: null, id: merchantId, name: "便利店" }],
      error: null,
    },
    transaction_item: {
      data: [
        {
          account_id: accountId,
          amount: "1200.00",
          category_id: childId1,
          note: null,
          transaction_record_id: transactionRecordId,
        },
        {
          account_id: accountId,
          amount: "45.50",
          category_id: childId2,
          note: null,
          transaction_record_id: transactionRecordId,
        },
      ],
      error: null,
    },
    transaction_record: {
      data: [
        {
          created_at: "2026-06-04T01:00:00.000Z",
          id: transactionRecordId,
          merchant_id: merchantId,
          note: "晚餐",
          transaction_at: "2026-06-04T10:30:05.000Z",
          type: "normal",
        },
      ],
      error: null,
    },
    transaction_record_tag: {
      data: [{ tag_id: tagId }],
      error: null,
    },
    transaction_tag: [
      {
        data: [{ color: null, id: tagId, name: "日常" }],
        error: null,
      },
      {
        data: [{ color: null, id: tagId, name: "日常" }],
        error: null,
      },
    ],
    ...overrides,
  });
}

function setupTransferEditViewData(transactionItems: unknown[]) {
  return setupSupabase({
    account: {
      data: [{ currency: "JPY", id: accountId, name: "日元现金" }],
      error: null,
    },
    category: { data: [], error: null },
    merchant: { data: [], error: null },
    transaction_item: {
      data: transactionItems,
      error: null,
    },
    transaction_record: {
      data: [
        {
          created_at: "2026-06-04T01:00:00.000Z",
          id: transactionRecordId,
          merchant_id: null,
          note: null,
          transaction_at: "2026-06-04T10:30:05.000Z",
          type: "transfer",
        },
      ],
      error: null,
    },
    transaction_tag: { data: [], error: null },
  });
}

describe("buildCategoryOptions", () => {
  it("只返回子分类，顶级分类不出现在结果中", () => {
    const rows = [
      {
        id: parentId,
        name: "食材/调料",
        parent_id: null,
        type: "expense" as const,
      },
      {
        id: childId1,
        name: "餐饮",
        parent_id: parentId,
        type: "expense" as const,
      },
    ];

    const result = buildCategoryOptions(rows);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(childId1);
  });

  it("子分类正确关联父分类的名称和 ID", () => {
    const rows = [
      {
        id: parentId,
        name: "食材/调料",
        parent_id: null,
        type: "expense" as const,
      },
      {
        id: childId1,
        name: "餐饮",
        parent_id: parentId,
        type: "expense" as const,
      },
    ];

    const result = buildCategoryOptions(rows);

    expect(result[0]).toEqual({
      id: childId1,
      name: "餐饮",
      parentId: parentId,
      parentName: "食材/调料",
      type: "expense",
    });
  });

  it("多个父分类下的子分类各自关联正确的父分类名称", () => {
    const parent2Id = "00000000-0000-4000-8000-000000005002";
    const rows = [
      {
        id: parentId,
        name: "食材/调料",
        parent_id: null,
        type: "expense" as const,
      },
      {
        id: parent2Id,
        name: "交通出行",
        parent_id: null,
        type: "expense" as const,
      },
      {
        id: childId1,
        name: "餐饮",
        parent_id: parentId,
        type: "expense" as const,
      },
      {
        id: childId2,
        name: "电车",
        parent_id: parent2Id,
        type: "expense" as const,
      },
    ];

    const result = buildCategoryOptions(rows);

    expect(result).toHaveLength(2);
    expect(result.find((row) => row.id === childId1)?.parentName).toBe(
      "食材/调料",
    );
    expect(result.find((row) => row.id === childId2)?.parentName).toBe(
      "交通出行",
    );
  });

  it("父分类在 DB 上不存在时 parentName 为 null", () => {
    const orphanParentId = "00000000-0000-4000-8000-000000009999";
    const rows = [
      {
        id: childId1,
        name: "餐饮",
        parent_id: orphanParentId,
        type: "expense" as const,
      },
    ];

    const result = buildCategoryOptions(rows);

    expect(result[0].parentName).toBeNull();
  });

  it("空数组时返回空数组", () => {
    expect(buildCategoryOptions([])).toEqual([]);
  });

  it("全部是顶级分类时返回空数组", () => {
    const rows = [
      {
        id: parentId,
        name: "食材/调料",
        parent_id: null,
        type: "expense" as const,
      },
    ];

    expect(buildCategoryOptions(rows)).toEqual([]);
  });
});

describe("loadEditTransactionView", () => {
  it("editId 不是 UUID 时调用 notFound", async () => {
    await expect(loadEditTransactionView("invalid-id")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.getCurrentLedgerOrRedirect).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("将既有记录转换为编辑表单初始值", async () => {
    setupEditViewData();

    await expect(loadEditTransactionView(transactionRecordId)).resolves.toEqual(
      {
        accountOptions: [{ currency: "JPY", id: accountId, name: "日元现金" }],
        categoryOptions: [
          {
            id: childId1,
            name: "午餐",
            parentId,
            parentName: "餐饮",
            type: "expense",
          },
          {
            id: childId2,
            name: "交通",
            parentId,
            parentName: "餐饮",
            type: "expense",
          },
        ],
        initialValues: {
          accountId,
          items: [
            { amount: "1200", categoryId: childId1 },
            { amount: "45.5", categoryId: childId2 },
          ],
          merchantId,
          note: "晚餐",
          tagNames: ["日常"],
          transactionAt: "2026-06-04T10:30:05.000Z",
          transactionRecordId,
          type: "expense",
        },
        ledgerName: "家庭账本",
        merchantOptions: [{ icon_url: null, id: merchantId, name: "便利店" }],
        tagOptions: [{ color: null, id: tagId, name: "日常" }],
      },
    );
  });

  it("回填当前记录已关联但已归档的标签", async () => {
    setupEditViewData({
      transaction_tag: [
        { data: [], error: null },
        { data: [{ color: null, id: tagId, name: "旧标签" }], error: null },
      ],
    });

    const result = await loadEditTransactionView(transactionRecordId);

    if (!("tagOptions" in result)) throw new Error("Expected expense view");
    expect(result.tagOptions).toEqual([]);
    expect(result.initialValues.tagNames).toEqual(["旧标签"]);
  });

  it("将 0 元明细转换为编辑表单初始值", async () => {
    setupEditViewData({
      transaction_item: {
        data: [
          {
            account_id: accountId,
            amount: "0.00",
            category_id: childId1,
            note: null,
            transaction_record_id: transactionRecordId,
          },
        ],
        error: null,
      },
      transaction_record: {
        data: [
          {
            created_at: "2026-06-04T01:00:00.000Z",
            id: transactionRecordId,
            merchant_id: merchantId,
            note: null,
            transaction_at: "2026-06-04T10:30:05.000Z",
            type: "normal",
          },
        ],
        error: null,
      },
    });

    const result = await loadEditTransactionView(transactionRecordId);

    if (!("categoryOptions" in result))
      throw new Error("Expected expense view");
    expect(result.initialValues.merchantId).toBe(merchantId);
    expect(result.initialValues.items).toEqual([
      { amount: "0", categoryId: childId1 },
    ]);
  });

  it("ledger 过滤后查不到目标记录时调用 notFound", async () => {
    setupEditViewData({
      transaction_record: { data: [], error: null },
    });

    await expect(loadEditTransactionView(transactionRecordId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it("能加载 transfer 编辑初始值", async () => {
    const fromAccountId = "00000000-0000-4000-8000-000000000041";
    const toAccountId = "00000000-0000-4000-8000-000000000042";

    setupSupabase({
      account: {
        data: [
          { currency: "JPY", id: fromAccountId, name: "日元现金" },
          { currency: "JPY", id: toAccountId, name: "储蓄账户" },
        ],
        error: null,
      },
      category: { data: [], error: null },
      merchant: { data: [], error: null },
      transaction_item: {
        data: [
          {
            account_id: fromAccountId,
            amount: "5000.00",
            balance_delta: "-5000.00",
          },
          {
            account_id: toAccountId,
            amount: "5000.00",
            balance_delta: "5000.00",
          },
        ],
        error: null,
      },
      transaction_record: {
        data: [
          {
            created_at: "2026-06-04T01:00:00.000Z",
            id: transactionRecordId,
            merchant_id: null,
            note: "转账备注",
            transaction_at: "2026-06-04T10:30:05.000Z",
            type: "transfer",
          },
        ],
        error: null,
      },
      transaction_tag: { data: [], error: null },
    });

    const result = await loadEditTransactionView(transactionRecordId);

    expect(result.initialValues).toEqual({
      accountId: fromAccountId,
      note: "转账备注",
      transactionAt: "2026-06-04T10:30:05.000Z",
      transactionRecordId,
      transferAmount: "5000",
      transferTargetAccountId: toAccountId,
      type: "transfer",
    });
    expect(result.accountOptions).toHaveLength(2);
    expect(result.ledgerName).toBe("家庭账本");
  });

  it("正确识别转出账户（balance_delta < 0）和转入账户（balance_delta > 0）", async () => {
    const fromAccountId = "00000000-0000-4000-8000-000000000041";
    const toAccountId = "00000000-0000-4000-8000-000000000042";

    setupSupabase({
      account: {
        data: [
          { currency: "JPY", id: fromAccountId, name: "日元现金" },
          { currency: "JPY", id: toAccountId, name: "储蓄账户" },
        ],
        error: null,
      },
      category: { data: [], error: null },
      merchant: { data: [], error: null },
      transaction_item: {
        data: [
          {
            account_id: toAccountId,
            amount: "1200.00",
            balance_delta: "1200.00",
          },
          {
            account_id: fromAccountId,
            amount: "1200.00",
            balance_delta: "-1200.00",
          },
        ],
        error: null,
      },
      transaction_record: {
        data: [
          {
            created_at: "2026-06-04T01:00:00.000Z",
            id: transactionRecordId,
            merchant_id: null,
            note: null,
            transaction_at: "2026-06-04T10:30:05.000Z",
            type: "transfer",
          },
        ],
        error: null,
      },
      transaction_tag: { data: [], error: null },
    });

    const result = await loadEditTransactionView(transactionRecordId);

    if (result.initialValues.type !== "transfer")
      throw new Error("Expected transfer view");
    expect(result.initialValues.accountId).toBe(fromAccountId);
    expect(result.initialValues.transferTargetAccountId).toBe(toAccountId);
  });

  it("transfer item 结构异常时调用 notFound", async () => {
    setupSupabase({
      account: {
        data: [{ currency: "JPY", id: accountId, name: "日元现金" }],
        error: null,
      },
      category: { data: [], error: null },
      merchant: { data: [], error: null },
      transaction_item: {
        data: [
          {
            account_id: accountId,
            amount: "1200.00",
            balance_delta: "-1200.00",
          },
        ],
        error: null,
      },
      transaction_record: {
        data: [
          {
            created_at: "2026-06-04T01:00:00.000Z",
            id: transactionRecordId,
            merchant_id: null,
            note: null,
            transaction_at: "2026-06-04T10:30:05.000Z",
            type: "transfer",
          },
        ],
        error: null,
      },
      transaction_tag: { data: [], error: null },
    });

    await expect(loadEditTransactionView(transactionRecordId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it("transfer item 有 3 条时调用 notFound", async () => {
    setupTransferEditViewData([
      {
        account_id: accountId,
        amount: "1200.00",
        balance_delta: "-1200.00",
      },
      {
        account_id: "00000000-0000-4000-8000-000000000042",
        amount: "1200.00",
        balance_delta: "1200.00",
      },
      {
        account_id: "00000000-0000-4000-8000-000000000043",
        amount: "0.00",
        balance_delta: "0.00",
      },
    ]);

    await expect(loadEditTransactionView(transactionRecordId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it("transfer 的转出与转入金额不一致时调用 notFound", async () => {
    setupTransferEditViewData([
      {
        account_id: accountId,
        amount: "1200.00",
        balance_delta: "-1200.00",
      },
      {
        account_id: "00000000-0000-4000-8000-000000000042",
        amount: "800.00",
        balance_delta: "800.00",
      },
    ]);

    await expect(loadEditTransactionView(transactionRecordId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it("transfer 的 amount 与 balance_delta 绝对值不一致时调用 notFound", async () => {
    setupTransferEditViewData([
      {
        account_id: accountId,
        amount: "1200.00",
        balance_delta: "-1200.00",
      },
      {
        account_id: "00000000-0000-4000-8000-000000000042",
        amount: "1200.00",
        balance_delta: "800.00",
      },
    ]);

    await expect(loadEditTransactionView(transactionRecordId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });
});
