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

import { loadEditTransactionView } from "./transactionForm";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const merchantId = "00000000-0000-4000-8000-000000001001";
const parentId = "00000000-0000-4000-8000-000000005003";
const incomeCategoryId = "00000000-0000-4000-8000-000000005073";
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
}

describe("loadEditTransactionView 普通交易类型", () => {
  it("income 记录编辑初始 type 正确", async () => {
    setupSupabase({
      account: {
        data: [{ currency: "JPY", id: accountId, name: "日元现金" }],
        error: null,
      },
      category: {
        data: [
          {
            id: parentId,
            name: "固定收入",
            parent_id: null,
            type: "income",
          },
          {
            id: incomeCategoryId,
            name: "工资",
            parent_id: parentId,
            type: "income",
          },
        ],
        error: null,
      },
      merchant: {
        data: [{ icon_url: null, id: merchantId, name: "公司" }],
        error: null,
      },
      transaction_item: {
        data: [
          {
            account_id: accountId,
            amount: "300000.00",
            category_id: incomeCategoryId,
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
            note: "工资入账",
            transaction_at: "2026-06-04T10:30:05.000Z",
            type: "normal",
          },
        ],
        error: null,
      },
      transaction_record_tag: { data: [], error: null },
      transaction_tag: [
        { data: [], error: null },
        { data: [], error: null },
      ],
    });

    const result = await loadEditTransactionView(transactionRecordId);

    expect("categoryOptions" in result).toBe(true);
    if (!("categoryOptions" in result)) return;
    expect(result.initialValues.type).toBe("income");
    expect(result.initialValues.items).toEqual([
      { amount: "300000", categoryId: incomeCategoryId },
    ]);
    expect(result.categoryOptions).toEqual([
      {
        id: incomeCategoryId,
        name: "工资",
        parentId,
        parentName: "固定收入",
        type: "income",
      },
    ]);
  });
});
