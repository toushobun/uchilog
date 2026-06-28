import { describe, expect, it } from "vitest";

import { matchesCategorySearch } from "./TransactionCategorySearch";

describe("TransactionCategorySearch", () => {
  it("支持中文、完整拼音和拼音首字母包含匹配", () => {
    expect(matchesCategorySearch("食材/调料", "食材")).toBe(true);
    expect(matchesCategorySearch("食材/调料", "shicai")).toBe(true);
    expect(matchesCategorySearch("食材/调料", "sctl")).toBe(true);
    expect(matchesCategorySearch("餐饮", "canyin")).toBe(true);
    expect(matchesCategorySearch("餐饮", "cy")).toBe(true);
  });

  it("忽略大小写、空格与分类分隔符", () => {
    expect(matchesCategorySearch("交通出行", "Jiao Tong")).toBe(true);
    expect(matchesCategorySearch("食材/调料", "食材调料")).toBe(true);
  });

  it("不匹配无关分类", () => {
    expect(matchesCategorySearch("餐饮", "gongzi")).toBe(false);
  });

  it("父子分类组合文本可匹配（UI 过滤侧使用 group/category 拼接文本）", () => {
    expect(matchesCategorySearch("食材/调料", "sctl")).toBe(true);
    expect(matchesCategorySearch("食材/调料", "食材调料")).toBe(true);
    expect(matchesCategorySearch("食材/调料", "shicaitiaoliao")).toBe(true);
  });
});
