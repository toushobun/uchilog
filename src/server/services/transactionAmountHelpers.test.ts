import { describe, expect, it } from "vitest";

import type {
  CategorySummaryDbRow,
  TransactionItemDbRow,
} from "server/db-types";

import { getTransactionRecordCategoryType } from "./transactionAmountHelpers";

const categoryById = new Map<string, CategorySummaryDbRow>([
  [
    "expense-category",
    {
      id: "expense-category",
      name: "支出分类",
      parent_id: null,
      type: "expense",
    },
  ],
  [
    "income-category",
    {
      id: "income-category",
      name: "收入分类",
      parent_id: null,
      type: "income",
    },
  ],
]);

function item(categoryId: string | null, amount: string): TransactionItemDbRow {
  return {
    account_id: "account-1",
    amount,
    category_id: categoryId,
    transaction_record_id: "record-1",
  };
}

describe("getTransactionRecordCategoryType", () => {
  it("净额为正时归为收入", () => {
    expect(
      getTransactionRecordCategoryType(
        [item("income-category", "1200"), item("expense-category", "200")],
        categoryById,
      ),
    ).toBe("income");
  });

  it("净额为负时归为支出", () => {
    expect(
      getTransactionRecordCategoryType(
        [item("income-category", "200"), item("expense-category", "1200")],
        categoryById,
      ),
    ).toBe("expense");
  });

  it("净额为零且包含支出分类时归为支出", () => {
    expect(
      getTransactionRecordCategoryType(
        [item("income-category", "500"), item("expense-category", "500")],
        categoryById,
      ),
    ).toBe("expense");
  });

  it("只有支出分类且金额为零时也归为支出", () => {
    expect(
      getTransactionRecordCategoryType(
        [item("expense-category", "0")],
        categoryById,
      ),
    ).toBe("expense");
  });

  it("只有收入分类且金额为零时归为收入", () => {
    expect(
      getTransactionRecordCategoryType(
        [item("income-category", "0")],
        categoryById,
      ),
    ).toBe("income");
  });
});
