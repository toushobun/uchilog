import { describe, expect, it } from "vitest";

import type { TransactionRecordDbRow } from "server/db-types";

import { filterTransactionRecords } from "./filters";
import type { TransactionGroupLoaderContext } from "./types";

const ledgerId = "00000000-0000-4000-8000-000000000001";

function record(id: string, transactionAt: string): TransactionRecordDbRow {
  return {
    created_at: transactionAt,
    created_by: null,
    id,
    merchant_id: null,
    note: null,
    transaction_at: transactionAt,
    type: "normal",
  };
}

function createContext(
  records: TransactionRecordDbRow[],
): TransactionGroupLoaderContext {
  return {
    accounts: [],
    categories: [],
    currentLedger: { baseCurrency: "JPY", id: ledgerId, name: "家庭账本" },
    items: [],
    merchants: [],
    records,
    recorders: [],
    tagAssignments: [],
    tagById: new Map(),
  };
}

describe("filterTransactionRecords - 日期筛选校验", () => {
  const records = [
    record("r1", "2026-06-10T00:00:00.000Z"),
    record("r2", "2026-06-20T00:00:00.000Z"),
  ];

  it("合法的日期范围按预期过滤", () => {
    const context = createContext(records);

    const filtered = filterTransactionRecords(context, {
      dateFrom: "2026-06-15",
      recordType: "all",
    });

    expect(filtered.map((r) => r.id)).toEqual(["r2"]);
  });

  it("非法的 dateFrom 不参与原始字符串比较，按未指定处理", () => {
    const context = createContext(records);

    const filtered = filterTransactionRecords(context, {
      dateFrom: "not-a-date",
      recordType: "all",
    });

    expect(filtered.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("非法的 dateTo 不参与原始字符串比较，按未指定处理", () => {
    const context = createContext(records);

    const filtered = filterTransactionRecords(context, {
      dateTo: "2026/06/15",
      recordType: "all",
    });

    expect(filtered.map((r) => r.id)).toEqual(["r1", "r2"]);
  });
});
