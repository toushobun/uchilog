import { describe, expect, it } from "vitest";

import {
  validateArchiveCategoryForm,
  validateCreateCategoryForm,
  validateUpdateCategoryForm,
} from "./categories";

const categoryId = "00000000-0000-4000-8000-000000000101";
const parentId = "00000000-0000-4000-8000-000000000102";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("categoryId", categoryId);
  formData.set("name", "食费");
  formData.set("type", "expense");
  formData.set("parentId", parentId);

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("category validators", () => {
  it("新增分类表单校验通过", () => {
    expect(validateCreateCategoryForm(createFormData())).toEqual({
      ok: true,
      value: {
        name: "食费",
        parentId,
        type: "expense",
      },
    });
  });

  it("新增大分类允许 parentId 为空", () => {
    const result = validateCreateCategoryForm(createFormData({ parentId: "" }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.parentId).toBeNull();
  });

  it("新增分类拒绝非法类型", () => {
    expect(
      validateCreateCategoryForm(createFormData({ type: "transfer" })),
    ).toEqual({
      error: "type_invalid",
      ok: false,
    });
  });

  it("新增分类拒绝过长名称", () => {
    expect(
      validateCreateCategoryForm(createFormData({ name: "あ".repeat(101) })),
    ).toEqual({
      error: "name_too_long",
      ok: false,
    });
  });

  it("更新分类表单校验通过", () => {
    const result = validateUpdateCategoryForm(createFormData());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ categoryId, name: "食费" });
    }
  });

  it("归档分类拒绝非法分类 ID", () => {
    expect(
      validateArchiveCategoryForm(createFormData({ categoryId: "invalid" })),
    ).toEqual({
      error: "category_invalid",
      ok: false,
    });
  });
});
