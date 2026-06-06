import { describe, expect, it } from "vitest";

import { formatAmount } from "utils/accounts";

describe("formatAmount", () => {
  it("可以按指定货币格式化 number 输入", () => {
    expect(formatAmount(1200, "JPY")).toBe("¥1,200");
  });

  it("可以按指定货币格式化数字字符串输入", () => {
    expect(formatAmount("1234.5", "USD")).toBe("$1,234.50");
  });

  it("金额输入无效时使用 fallback 文案", () => {
    expect(formatAmount("not-a-number", "JPY")).toBe("not-a-number JPY");
  });

  it("金额输入为 null 时使用 fallback 文案", () => {
    expect(formatAmount(null, "JPY")).toBe("-- JPY");
  });

  it("Intl 无法格式化货币时使用 fallback 文案", () => {
    expect(formatAmount(1200, "INVALID")).toBe("1200 INVALID");
  });
});
