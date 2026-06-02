import { describe, expect, it } from "vitest";

import { getMerchantInitial, normalizeSearchText } from "./types";

describe("getMerchantInitial", () => {
  it("returns an uppercase initial for English merchant names", () => {
    expect(getMerchantInitial("amazon")).toBe("A");
  });

  it("returns the first character for Chinese merchant names", () => {
    expect(getMerchantInitial("罗森")).toBe("罗");
  });

  it("returns the first character for Japanese merchant names", () => {
    expect(getMerchantInitial("スギ薬局")).toBe("ス");
  });

  it("returns a fallback for empty names", () => {
    expect(getMerchantInitial("")).toBe("?");
  });

  it("trims surrounding whitespace before taking the initial", () => {
    expect(getMerchantInitial("  life")).toBe("L");
  });
});

describe("normalizeSearchText", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeSearchText("  LIFE  ")).toBe("life");
  });

  it("normalizes English text to lowercase", () => {
    expect(normalizeSearchText("Amazon")).toBe("amazon");
  });

  it("keeps Chinese text searchable as-is", () => {
    expect(normalizeSearchText(" 来福 ")).toBe("来福");
  });

  it("keeps Japanese text searchable as-is", () => {
    expect(normalizeSearchText(" ライフ ")).toBe("ライフ");
  });
});
