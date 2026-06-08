import { describe, expect, it } from "vitest";

import {
  transactionBorderColor,
  transactionExpenseColor,
  transactionIncomeColor,
  transactionPrimaryColor,
  transactionSoftBackgroundColor,
  transactionSummaryBackgroundColor,
} from "./transactionColors";

describe("transactionColors", () => {
  it("定义交易相关颜色 token", () => {
    expect(transactionIncomeColor).toBe("#d64b4b");
    expect(transactionExpenseColor).toBe("#3f7f46");
    expect(transactionPrimaryColor).toBe("#6d4bb3");
    expect(transactionSummaryBackgroundColor).toBe("#e8e0f8");
    expect(transactionSoftBackgroundColor).toBe("#f4efff");
    expect(transactionBorderColor).toBe("#e5dcf6");
  });
});
