import { describe, expect, it } from "vitest";

import type { TransactionCategoryOption } from "types/transactions";

import {
  buildCategoryPickerGroups,
  formatCategoryName,
  formatSummaryDateTime,
  isValidMoneyText,
} from "./TransactionForm.utils";

function createCategory(
  overrides: Partial<TransactionCategoryOption>,
): TransactionCategoryOption {
  return {
    id: "cat-1",
    name: "食品",
    parentId: null,
    parentName: null,
    type: "expense",
    ...overrides,
  };
}

describe("buildCategoryPickerGroups", () => {
  it("有父分类时按父分类归组", () => {
    const categories = [
      createCategory({
        id: "1",
        name: "午饭",
        parentId: "p1",
        parentName: "食品",
      }),
      createCategory({
        id: "2",
        name: "晚饭",
        parentId: "p1",
        parentName: "食品",
      }),
      createCategory({
        id: "3",
        name: "地铁",
        parentId: "p2",
        parentName: "交通",
      }),
    ];
    const result = buildCategoryPickerGroups(categories);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "p1",
      name: "食品",
      categories: [categories[0], categories[1]],
    });
    expect(result[1]).toEqual({
      id: "p2",
      name: "交通",
      categories: [categories[2]],
    });
  });

  it("无父分类时以自身名称作为分组名", () => {
    const category = createCategory({
      id: "1",
      name: "其他",
      parentId: null,
      parentName: null,
    });
    const result = buildCategoryPickerGroups([category]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "", name: "其他", categories: [category] });
  });

  it("空数组时返回空组", () => {
    expect(buildCategoryPickerGroups([])).toEqual([]);
  });

  it("保留分类的原始顺序", () => {
    const categories = [
      createCategory({ id: "3", name: "C", parentId: "p1", parentName: "G1" }),
      createCategory({ id: "1", name: "A", parentId: "p2", parentName: "G2" }),
      createCategory({ id: "2", name: "B", parentId: "p1", parentName: "G1" }),
    ];
    const result = buildCategoryPickerGroups(categories);

    expect(result[0]?.categories.map((c) => c.id)).toEqual(["3", "2"]);
  });
});

describe("formatCategoryName", () => {
  it("有父分类时显示 '父 / 子' 格式", () => {
    const category = createCategory({ name: "午饭", parentName: "食品" });
    expect(formatCategoryName(category)).toBe("食品 / 午饭");
  });

  it("无父分类时只显示自身名称", () => {
    const category = createCategory({ name: "其他", parentName: null });
    expect(formatCategoryName(category)).toBe("其他");
  });
});

describe("formatSummaryDateTime", () => {
  it("正常格式化日期和时间", () => {
    expect(formatSummaryDateTime("2026-06-23", "10:30")).toBe(
      "2026/06/23 10:30:00",
    );
  });

  it("包含秒数时原样保留", () => {
    expect(formatSummaryDateTime("2026-06-23", "10:30:45")).toBe(
      "2026/06/23 10:30:45",
    );
  });

  it("日期格式不正确时返回未选择", () => {
    expect(formatSummaryDateTime("", "10:30")).toBe("未选择");
    expect(formatSummaryDateTime("2026-06", "10:30")).toBe("未选择");
  });

  it("时间格式不正确时返回未选择", () => {
    expect(formatSummaryDateTime("2026-06-23", "")).toBe("未选择");
  });
});

describe("isValidMoneyText", () => {
  it("整数金额有效", () => {
    expect(isValidMoneyText("0")).toBe(true);
    expect(isValidMoneyText("100")).toBe(true);
    expect(isValidMoneyText("9999999")).toBe(true);
  });

  it("最多两位小数有效", () => {
    expect(isValidMoneyText("100.5")).toBe(true);
    expect(isValidMoneyText("100.50")).toBe(true);
  });

  it("空字符串或纯空格无效", () => {
    expect(isValidMoneyText("")).toBe(false);
    expect(isValidMoneyText("   ")).toBe(false);
  });

  it("非数字字符无效", () => {
    expect(isValidMoneyText("abc")).toBe(false);
    expect(isValidMoneyText("1.2a")).toBe(false);
  });

  it("负数无效", () => {
    expect(isValidMoneyText("-100")).toBe(false);
  });

  it("小数点超过两位无效", () => {
    expect(isValidMoneyText("100.001")).toBe(false);
  });

  it("末尾小数点无效", () => {
    expect(isValidMoneyText("100.")).toBe(false);
  });

  it("多个小数点无效", () => {
    expect(isValidMoneyText("1.2.3")).toBe(false);
  });
});
