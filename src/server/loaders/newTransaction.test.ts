import { describe, expect, it } from "vitest";

import { buildCategoryOptions } from "./newTransaction";

const parentId = "00000000-0000-4000-8000-000000005001";
const childId1 = "00000000-0000-4000-8000-000000005072";
const childId2 = "00000000-0000-4000-8000-000000005073";

describe("buildCategoryOptions", () => {
  it("只返回子分类，顶级分类不出现在结果中", () => {
    const rows = [
      { id: parentId, name: "食材/调料", parent_id: null, type: "expense" as const },
      { id: childId1, name: "餐饮", parent_id: parentId, type: "expense" as const },
    ];

    const result = buildCategoryOptions(rows);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(childId1);
  });

  it("子分类正确关联父分类的名称和 ID", () => {
    const rows = [
      { id: parentId, name: "食材/调料", parent_id: null, type: "expense" as const },
      { id: childId1, name: "餐饮", parent_id: parentId, type: "expense" as const },
    ];

    const result = buildCategoryOptions(rows);

    expect(result[0]).toEqual({
      id: childId1,
      name: "餐饮",
      parentId: parentId,
      parentName: "食材/调料",
      type: "expense",
    });
  });

  it("多个父分类下的子分类各自关联正确的父分类名称", () => {
    const parent2Id = "00000000-0000-4000-8000-000000005002";
    const rows = [
      { id: parentId, name: "食材/调料", parent_id: null, type: "expense" as const },
      { id: parent2Id, name: "交通出行", parent_id: null, type: "expense" as const },
      { id: childId1, name: "餐饮", parent_id: parentId, type: "expense" as const },
      { id: childId2, name: "电车", parent_id: parent2Id, type: "expense" as const },
    ];

    const result = buildCategoryOptions(rows);

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.id === childId1)?.parentName).toBe("食材/调料");
    expect(result.find((r) => r.id === childId2)?.parentName).toBe("交通出行");
  });

  it("父分类在 DB 上不存在时 parentName 为 null", () => {
    const orphanParentId = "00000000-0000-4000-8000-000000009999";
    const rows = [
      { id: childId1, name: "餐饮", parent_id: orphanParentId, type: "expense" as const },
    ];

    const result = buildCategoryOptions(rows);

    expect(result[0].parentName).toBeNull();
  });

  it("空数组时返回空数组", () => {
    expect(buildCategoryOptions([])).toEqual([]);
  });

  it("全部是顶级分类时返回空数组", () => {
    const rows = [
      { id: parentId, name: "食材/调料", parent_id: null, type: "expense" as const },
    ];

    expect(buildCategoryOptions(rows)).toEqual([]);
  });
});
