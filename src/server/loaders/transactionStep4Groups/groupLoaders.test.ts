import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentLedgerOrRedirect: vi.fn(),
}));

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerOrRedirect: mocks.getCurrentLedgerOrRedirect,
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  loadStep4TransactionGroupItems,
  loadStep4TransactionGroupPage,
} from "./groupLoaders";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const expenseCategoryId = "00000000-0000-4000-8000-000000005001";

type Row = Record<string, unknown>;

function createFakeSupabase(tables: Record<string, Row[]>) {
  const callCounts: Record<string, number> = {};
  const rangeCallsByTable: Record<string, [number, number][]> = {};

  const from = vi.fn((table: string) => {
    callCounts[table] = (callCounts[table] ?? 0) + 1;
    let rows = [...(tables[table] ?? [])];
    const orderSpecs: { ascending: boolean; column: string }[] = [];

    function applyOrder() {
      if (orderSpecs.length === 0) return;
      rows = [...rows].sort((a, b) => {
        for (const spec of orderSpecs) {
          const left = String(a[spec.column] ?? "");
          const right = String(b[spec.column] ?? "");
          if (left === right) continue;
          const comparison = left > right ? 1 : -1;
          return spec.ascending ? comparison : -comparison;
        }
        return 0;
      });
    }

    const builder = {
      eq(column: string, value: unknown) {
        rows = rows.filter((row) => row[column] === value);
        return builder;
      },
      gte(column: string, value: string) {
        rows = rows.filter((row) => String(row[column]) >= value);
        return builder;
      },
      in(column: string, values: unknown[]) {
        rows = rows.filter((row) => values.includes(row[column]));
        return builder;
      },
      is(column: string, value: null) {
        rows = rows.filter((row) => (row[column] ?? null) === value);
        return builder;
      },
      lt(column: string, value: string) {
        rows = rows.filter((row) => String(row[column]) < value);
        return builder;
      },
      order(column: string, options: { ascending: boolean }) {
        orderSpecs.push({ ascending: options.ascending, column });
        return builder;
      },
      range(rangeFrom: number, rangeTo: number) {
        applyOrder();
        rangeCallsByTable[table] = rangeCallsByTable[table] ?? [];
        rangeCallsByTable[table].push([rangeFrom, rangeTo]);
        return Promise.resolve({ data: rows.slice(rangeFrom, rangeTo + 1) });
      },
      select() {
        return builder;
      },
      then(resolve: (value: { data: Row[]; error: null }) => unknown) {
        applyOrder();
        return Promise.resolve({ data: rows, error: null }).then(resolve);
      },
    };

    return builder;
  });

  return { callCounts, from, rangeCallsByTable };
}

function createRecord({
  createdAt,
  id,
  merchantId = null,
  transactionAt,
  type = "normal",
}: {
  createdAt: string;
  id: string;
  merchantId?: string | null;
  transactionAt: string;
  type?: string;
}): Row {
  return {
    created_at: createdAt,
    created_by: null,
    id,
    ledger_id: ledgerId,
    merchant_id: merchantId,
    note: null,
    status: "active",
    transaction_at: transactionAt,
    type,
  };
}

function createItem({
  amount,
  categoryId = expenseCategoryId,
  recordId,
}: {
  amount: string;
  categoryId?: string | null;
  recordId: string;
}): Row {
  return {
    account_id: accountId,
    amount,
    balance_delta: amount,
    category_id: categoryId,
    ledger_id: ledgerId,
    note: null,
    transaction_record_id: recordId,
  };
}

function monthRecordId(month: number, day: number) {
  return `00000000-0000-4000-8000-0000000${String(month).padStart(
    2,
    "0",
  )}${String(day).padStart(2, "0")}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentLedgerOrRedirect.mockResolvedValue({
    baseCurrency: "JPY",
    id: ledgerId,
    name: "家庭账本",
  });
});

describe("loadStep4TransactionGroupPage - 时间维度分组增量扫描", () => {
  it("按月分组翻页时只扫描满足当前页所需的记录，不会拉取整个 ledger", async () => {
    // 构造 12 个月、每月 1 笔记录，总计 12 笔——远多于 pageSize(20) 所需的分组数。
    const records: Row[] = [];
    const items: Row[] = [];

    for (let month = 1; month <= 12; month += 1) {
      const id = monthRecordId(month, 1);
      records.push(
        createRecord({
          createdAt: `2026-${String(month).padStart(2, "0")}-01T00:00:00.000Z`,
          id,
          transactionAt: `2026-${String(month).padStart(2, "0")}-01T00:00:00.000Z`,
        }),
      );
      items.push(createItem({ amount: "1000", recordId: id }));
    }

    const fakeDb = createFakeSupabase({
      account: [
        { currency: "JPY", id: accountId, ledger_id: ledgerId, name: "现金" },
      ],
      category: [
        {
          id: expenseCategoryId,
          ledger_id: ledgerId,
          name: "餐饮",
          parent_id: null,
          type: "expense",
        },
      ],
      transaction_item: items,
      transaction_record: records,
    });
    mocks.createClient.mockResolvedValue(fakeDb);

    const page = await loadStep4TransactionGroupPage("month", 0, {
      recordType: "all",
    });

    expect(page.groups).toHaveLength(12);
    expect(page.nextOffset).toBeNull();

    // 12 笔记录只需 1 批（scan page size 100）即可覆盖，不应发生多批扫描。
    expect(fakeDb.rangeCallsByTable.transaction_record).toHaveLength(1);
  });

  it("ledger 中记录远多于目标分组数时，增量扫描会提前停止而不会拉取全部记录", async () => {
    // 构造 400 笔记录、跨 400 个月，第一页只需要最新的 21 个分组（pageSize+1）。
    const records: Row[] = [];
    const items: Row[] = [];

    for (let index = 0; index < 400; index += 1) {
      const year = 2026 - Math.floor(index / 12);
      const month = 12 - (index % 12);
      const id = `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
      const transactionAt = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;

      records.push(
        createRecord({ createdAt: transactionAt, id, transactionAt }),
      );
      items.push(createItem({ amount: "1000", recordId: id }));
    }

    const fakeDb = createFakeSupabase({
      account: [
        { currency: "JPY", id: accountId, ledger_id: ledgerId, name: "现金" },
      ],
      category: [
        {
          id: expenseCategoryId,
          ledger_id: ledgerId,
          name: "餐饮",
          parent_id: null,
          type: "expense",
        },
      ],
      transaction_item: items,
      transaction_record: records,
    });
    mocks.createClient.mockResolvedValue(fakeDb);

    const page = await loadStep4TransactionGroupPage("month", 0, {
      recordType: "all",
    });

    expect(page.groups).toHaveLength(20);
    expect(page.nextOffset).toBe(20);

    const totalScannedRecords = (
      fakeDb.rangeCallsByTable.transaction_record ?? []
    ).reduce((sum, [from, to]) => sum + (to - from + 1), 0);

    // 400 笔记录中，只应扫描到覆盖 21 个分组所需的前几批（远小于 400）。
    expect(totalScannedRecords).toBeLessThan(400);
    expect(totalScannedRecords).toBeGreaterThanOrEqual(21);
  });

  it("分类筛选下仍能正确聚合，且分组按最新时间倒序排列", async () => {
    const olderId = monthRecordId(1, 1);
    const newerId = monthRecordId(6, 1);

    const fakeDb = createFakeSupabase({
      account: [
        { currency: "JPY", id: accountId, ledger_id: ledgerId, name: "现金" },
      ],
      category: [
        {
          id: expenseCategoryId,
          ledger_id: ledgerId,
          name: "餐饮",
          parent_id: null,
          type: "expense",
        },
      ],
      transaction_item: [
        createItem({ amount: "500", recordId: olderId }),
        createItem({ amount: "700", recordId: newerId }),
      ],
      transaction_record: [
        createRecord({
          createdAt: "2026-01-01T00:00:00.000Z",
          id: olderId,
          transactionAt: "2026-01-01T00:00:00.000Z",
        }),
        createRecord({
          createdAt: "2026-06-01T00:00:00.000Z",
          id: newerId,
          transactionAt: "2026-06-01T00:00:00.000Z",
        }),
      ],
    });
    mocks.createClient.mockResolvedValue(fakeDb);

    const page = await loadStep4TransactionGroupPage("month", 0, {
      categoryId: expenseCategoryId,
      recordType: "all",
    });

    expect(page.groups.map((group) => group.key)).toEqual([
      "2026-06",
      "2026-01",
    ]);
    expect(page.groups[0].summary.expense).toBe("700");
    expect(page.groups[1].summary.expense).toBe("500");
  });
});

describe("loadStep4TransactionGroupItems", () => {
  it("按月读取组内明细，转账记录不影响分组收支但计入笔数", async () => {
    const expenseId = monthRecordId(6, 1);
    const transferId = monthRecordId(6, 2);

    const fakeDb = createFakeSupabase({
      account: [
        { currency: "JPY", id: accountId, ledger_id: ledgerId, name: "现金" },
      ],
      category: [
        {
          id: expenseCategoryId,
          ledger_id: ledgerId,
          name: "餐饮",
          parent_id: null,
          type: "expense",
        },
      ],
      transaction_item: [createItem({ amount: "1000", recordId: expenseId })],
      transaction_record: [
        createRecord({
          createdAt: "2026-06-01T00:00:00.000Z",
          id: expenseId,
          transactionAt: "2026-06-01T00:00:00.000Z",
        }),
        createRecord({
          createdAt: "2026-06-02T00:00:00.000Z",
          id: transferId,
          transactionAt: "2026-06-02T00:00:00.000Z",
          type: "transfer",
        }),
      ],
    });
    mocks.createClient.mockResolvedValue(fakeDb);

    const page = await loadStep4TransactionGroupItems("month", "2026-06", 0, {
      recordType: "all",
    });

    expect(page.groups).toHaveLength(2);
    const totalItems = page.groups.reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
    expect(totalItems).toBe(2);
  });
});
