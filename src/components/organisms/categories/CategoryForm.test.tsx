import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryForm } from "./CategoryForm";

afterEach(() => {
  cleanup();
});

const parentOptions = [
  { id: "expense-root", name: "餐饮", type: "expense" as const },
  { id: "income-root", name: "工资", type: "income" as const },
];

describe("CategoryForm", () => {
  it("显示新增分类表单", () => {
    const { container } = render(
      <CategoryForm
        createCategoryAction={vi.fn(async () => {})}
        parentOptions={parentOptions}
      />,
    );

    expect(
      within(container).getByRole("heading", { name: "新增分类" }),
    ).toBeTruthy();
    expect(
      within(container).getByPlaceholderText("例如：餐饮、工资、交通"),
    ).toBeTruthy();
    expect(within(container).getAllByText("分类类型").length).toBeGreaterThan(
      0,
    );
    expect(within(container).getAllByText("上级分类").length).toBeGreaterThan(
      0,
    );
    expect(
      within(container).getByRole("button", { name: "新增分类" }),
    ).toBeTruthy();
  });

  it("说明大分类和小分类的创建方式", () => {
    const { container } = render(
      <CategoryForm
        createCategoryAction={vi.fn(async () => {})}
        parentOptions={parentOptions}
      />,
    );

    expect(
      within(container).getByText(
        "留空时创建大分类；选择大分类时创建可用于记账的小分类。",
      ),
    ).toBeTruthy();
  });

  it("支出类型下只显示支出分类选项", () => {
    const { container } = render(
      <CategoryForm
        createCategoryAction={vi.fn(async () => {})}
        parentOptions={parentOptions}
      />,
    );

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "上级分类" }),
    );

    expect(screen.getByText("餐饮")).toBeTruthy();
    expect(screen.queryByText("工资")).toBeNull();
  });

  it("切换为收入类型后只显示收入分类选项", () => {
    const { container } = render(
      <CategoryForm
        createCategoryAction={vi.fn(async () => {})}
        parentOptions={parentOptions}
      />,
    );

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "分类类型" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "收入" }));

    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "上级分类" }),
    );

    expect(screen.getByText("工资")).toBeTruthy();
    expect(screen.queryByText("餐饮")).toBeNull();
  });

  it("没有上级分类候选时也能显示表单", () => {
    const { container } = render(
      <CategoryForm
        createCategoryAction={vi.fn(async () => {})}
        parentOptions={[]}
      />,
    );

    expect(
      within(container).getByRole("button", { name: "新增分类" }),
    ).toBeTruthy();
    // 打开上级分类下拉，确认只有"无上级分类"选项
    fireEvent.mouseDown(
      within(container).getByRole("combobox", { name: "上级分类" }),
    );
    expect(screen.getByText("无上级分类")).toBeTruthy();
  });
});
