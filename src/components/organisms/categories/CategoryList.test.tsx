import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryList } from "./CategoryList";

const categories = [
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
  {
    children: [],
    created_at: "2026-01-01T00:00:00.000Z",
    id: "income-root",
    name: "工资",
    parent_id: null,
    sort_order: 10,
    type: "income" as const,
  },
];

afterEach(() => {
  cleanup();
});

describe("CategoryList", () => {
  it("按支出和收入显示分类", () => {
    const { container } = render(
      <CategoryList
        archiveCategoryAction={vi.fn(async () => {})}
        categories={categories}
        errorCategoryId={null}
        errorMessage={null}
        updateCategoryAction={vi.fn(async () => {})}
      />,
    );

    expect(
      within(container).getByRole("heading", { name: "支出分类" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("heading", { name: "收入分类" }),
    ).toBeInTheDocument();
    expect(within(container).getByDisplayValue("餐饮")).toBeInTheDocument();
    expect(within(container).getByDisplayValue("外食")).toBeInTheDocument();
    expect(within(container).getByDisplayValue("工资")).toBeInTheDocument();
  });

  it("没有分类时显示空状态", () => {
    const { container } = render(
      <CategoryList
        archiveCategoryAction={vi.fn(async () => {})}
        categories={[]}
        errorCategoryId={null}
        errorMessage={null}
        updateCategoryAction={vi.fn(async () => {})}
      />,
    );

    expect(within(container).getByText("还没有分类")).toBeInTheDocument();
    expect(
      within(container).getByText("先新增一个大分类，再在它下面新增小分类。"),
    ).toBeInTheDocument();
  });

  it("显示指定分类的错误信息", () => {
    const { container } = render(
      <CategoryList
        archiveCategoryAction={vi.fn(async () => {})}
        categories={categories}
        errorCategoryId="expense-child"
        errorMessage="分类更新失败。"
        updateCategoryAction={vi.fn(async () => {})}
      />,
    );

    expect(within(container).getByRole("alert").textContent).toBe(
      "分类更新失败。",
    );
  });

  it("点击归档按钮时提交对应分类", () => {
    const archiveCategoryAction = vi.fn(async () => {});
    const { container } = render(
      <CategoryList
        archiveCategoryAction={archiveCategoryAction}
        categories={categories}
        errorCategoryId={null}
        errorMessage={null}
        updateCategoryAction={vi.fn(async () => {})}
      />,
    );

    fireEvent.click(
      within(container).getAllByRole("button", { name: "归档" })[0],
    );

    expect(archiveCategoryAction).toHaveBeenCalledTimes(1);
  });
});
