import { describe, expect, it } from "vitest";

import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";

import { buildTransactionGroupSummaryPage } from "./transactionGroupBuilder";

const expenseCategory: CategorySummaryDbRow = {
  id: "expense-category",
  name: "支出分类",
  parent_id: null,
  type: "expense",
};

const incomeCategory: CategorySummaryDbRow = {
  id: "income-category",
  name: "收入分类",
  parent_id: null,
  type: "income",
};

const categories = [expenseCategory, incomeCategory];
const accounts: AccountOptionDbRow[] = [];
const merchants: { id: string; name: string }[] = [];
const recorders: AppUserSummaryDbRow[] = [];

function record(
  id: string,
  transactionAt: string,
  type: TransactionRecordDbRow["type"] = "normal",
): TransactionRecordDbRow {
  return {
    created_at: transactionAt,
    created_by: null,
    id,
    merchant_id: null,
    note: null,
    transaction_at: transactionAt,
    type,
  };
}

function item(
  recordId: string,
  categoryId: string | null,
  amount: string,
): TransactionItemDbRow {
  return {
    account_id: "account-1",
    amount,
    category_id: categoryId,
    transaction_record_id: recordId,
  };
}

describe("buildTransactionGroupSummaryPage", () => {
  it("转账记录计入分组笔数但不计入收支汇总", () => {
    const records = [
      record("expense-1", "2026-06-10T01:00:00.000Z"),
      record("transfer-1", "2026-06-10T02:00:00.000Z", "transfer"),
    ];
    const items = [item("expense-1", expenseCategory.id, "1200")];

    const page = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items,
      merchants,
      offset: 0,
      pageSize: 20,
      records,
      recorders,
      tagAssignments: [],
    });

    expect(page.groups).toHaveLength(1);
    expect(page.groups[0].transactionCount).toBe(2);
    expect(page.groups[0].summary).toEqual({
      balance: "-1200",
      currency: "JPY",
      expense: "1200",
      income: "0",
    });
  });

  it("净额为零时按分类类型归属收支：仅含支出分类归为支出", () => {
    const records = [record("zero-expense", "2026-06-10T01:00:00.000Z")];
    const items = [item("zero-expense", expenseCategory.id, "0")];

    const page = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items,
      merchants,
      offset: 0,
      pageSize: 20,
      records,
      recorders,
      tagAssignments: [],
    });

    expect(page.groups[0].transactionCount).toBe(1);
    expect(page.groups[0].summary).toEqual({
      balance: "0",
      currency: "JPY",
      expense: "0",
      income: "0",
    });
  });

  it("净额为零的混合收支记录不影响分组收支汇总，但仍计入笔数", () => {
    const records = [record("mixed-zero", "2026-06-10T01:00:00.000Z")];
    const items = [
      item("mixed-zero", incomeCategory.id, "500"),
      item("mixed-zero", expenseCategory.id, "500"),
    ];

    const page = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items,
      merchants,
      offset: 0,
      pageSize: 20,
      records,
      recorders,
      tagAssignments: [],
    });

    expect(page.groups[0].transactionCount).toBe(1);
    expect(page.groups[0].summary).toEqual({
      balance: "0",
      currency: "JPY",
      expense: "0",
      income: "0",
    });
  });

  it("按分组分页并返回 nextOffset", () => {
    const records = [
      record("r1", "2026-06-10T00:00:00.000Z"),
      record("r2", "2026-05-10T00:00:00.000Z"),
      record("r3", "2026-04-10T00:00:00.000Z"),
    ];
    const items = [
      item("r1", expenseCategory.id, "100"),
      item("r2", expenseCategory.id, "200"),
      item("r3", expenseCategory.id, "300"),
    ];

    const page = buildTransactionGroupSummaryPage({
      accounts,
      categories,
      currency: "JPY",
      groupBy: "month",
      items,
      merchants,
      offset: 0,
      pageSize: 2,
      records,
      recorders,
      tagAssignments: [],
    });

    expect(page.groups.map((group) => group.key)).toEqual([
      "2026-06",
      "2026-05",
    ]);
    expect(page.nextOffset).toBe(2);
  });
});
