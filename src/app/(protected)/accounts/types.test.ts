import { describe, expect, it } from "vitest";

import { formatAmount } from "./types";

describe("formatAmount", () => {
  it("formats number input with the requested currency", () => {
    expect(formatAmount(1200, "JPY")).toBe("¥1,200");
  });

  it("formats numeric string input with the requested currency", () => {
    expect(formatAmount("1234.5", "USD")).toBe("$1,234.50");
  });

  it("falls back for invalid amount input", () => {
    expect(formatAmount("not-a-number", "JPY")).toBe("not-a-number JPY");
  });

  it("falls back for null amount input", () => {
    expect(formatAmount(null, "JPY")).toBe("null JPY");
  });

  it("falls back when Intl cannot format the currency", () => {
    expect(formatAmount(1200, "INVALID")).toBe("1200 INVALID");
  });
});
