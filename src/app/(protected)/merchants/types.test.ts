import { describe, expect, it } from "vitest";

import { getMerchantInitial, normalizeSearchText } from "utils/merchants";

describe("getMerchantInitial", () => {
  it("英文商家名返回大写首字母", () => {
    expect(getMerchantInitial("amazon")).toBe("A");
  });

  it("中文商家名返回第一个字符", () => {
    expect(getMerchantInitial("罗森")).toBe("罗");
  });

  it("日文商家名返回第一个字符", () => {
    expect(getMerchantInitial("スギ薬局")).toBe("ス");
  });

  it("空字符串返回 fallback", () => {
    expect(getMerchantInitial("")).toBe("?");
  });

  it("取首字母前会去掉前后空格", () => {
    expect(getMerchantInitial("  life")).toBe("L");
  });
});

describe("normalizeSearchText", () => {
  it("会去掉前后空格", () => {
    expect(normalizeSearchText("  LIFE  ")).toBe("life");
  });

  it("会将英文文本转为小写", () => {
    expect(normalizeSearchText("Amazon")).toBe("amazon");
  });

  it("中文文本保持原样用于搜索", () => {
    expect(normalizeSearchText(" 来福 ")).toBe("来福");
  });

  it("日文文本保持原样用于搜索", () => {
    expect(normalizeSearchText(" ライフ ")).toBe("ライフ");
  });
});
