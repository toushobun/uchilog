import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoriesTemplate } from "./Categories";

const baseProps = {
  archiveCategoryAction: vi.fn(async () => {}),
  categories: [
    {
      children: [
        {
          created_at: "2026-01-01T00:00:00.000Z",
          id: "expense-child",
          name: "外食",
          parent_id: "expense-root",
          sort_order: 10,
          type: "expense" as const,
        },
      ],
      created_at: "2026-01-01T00:00:00.000Z",
      id: "expense-root",
      name: "餐饮",
      parent_id: null,
      sort_order: 10,
      type: "expense" as const,
    },
  ],
  createCategoryAction: vi.fn(async () => {}),
  errorCategoryId: null,
  errorMessage: null,
  ledgerName: "家庭账本",
  parentOptions: [
    { id: "expense-root", name: "餐饮", type: "expense" as const },
  ],
  updateCategoryAction: vi.fn(async () => {}),
};

afterEach(() => {
  cleanup();
});

describe("CategoriesTemplate", () => {
  it("显示分类页面标题和当前账本", () => {
    const { container } = render(<CategoriesTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "分类" }),
    ).toBeTruthy();
    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
  });

  it("显示新增表单和分类列表", () => {
    const { container } = render(<CategoriesTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "新增分类" }),
    ).toBeTruthy();
    expect(within(container).getByDisplayValue("餐饮")).toBeTruthy();
    expect(within(container).getByDisplayValue("外食")).toBeTruthy();
  });

  it("显示全局错误信息", () => {
    const { container } = render(
      <CategoriesTemplate {...baseProps} errorMessage="请输入分类名称。" />,
    );

    const alert = within(container).getByRole("alert");

    expect(alert.textContent).toContain("分类操作失败");
    expect(alert.textContent).toContain("请输入分类名称。");
  });
});
