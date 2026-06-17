import { describe, expect, it } from "vitest";

import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";

import {
  isTooManyTransactionTags,
  isTransactionTagNameTooLong,
} from "./transactionTagRules";

describe("transactionTagRules", () => {
  it("标签数量超过上限时返回 true，刚好达到上限仍合法", () => {
    const maxTags = Array.from(
      { length: maxTransactionTagCount },
      (_, index) => `标签${index + 1}`,
    );
    const tooManyTags = [...maxTags, "追加标签"];

    expect(isTooManyTransactionTags(maxTags)).toBe(false);
    expect(isTooManyTransactionTags(tooManyTags)).toBe(true);
  });

  it("标签名超过最大长度时返回 true", () => {
    expect(
      isTransactionTagNameTooLong("あ".repeat(maxTransactionTagNameLength)),
    ).toBe(false);
    expect(
      isTransactionTagNameTooLong("あ".repeat(maxTransactionTagNameLength + 1)),
    ).toBe(true);
  });
});
