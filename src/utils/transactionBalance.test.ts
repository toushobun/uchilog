import { describe, expect, it } from "vitest";

import { getBalanceDelta } from "./transactionBalance";

describe("getBalanceDelta", () => {
  it("支出时返回负数余额变化值", () => {
    expect(getBalanceDelta("expense", 1200)).toBe(-1200);
  });

  it("收入时返回正数余额变化值", () => {
    expect(getBalanceDelta("income", 1200)).toBe(1200);
  });
});
