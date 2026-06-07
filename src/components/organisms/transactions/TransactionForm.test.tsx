import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionForm } from "./TransactionForm";

const accountOptions = [
  {
    id: "00000000-0000-4000-8000-000000000045",
    name: "日元现金",
    currency: "JPY",
  },
];

const categoryOptions = [
  {
    id: "00000000-0000-4000-8000-000000005072",
    name: "餐饮",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "工资",
    type: "income" as const,
  },
];

const merchantOptions = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "便利店",
    icon_url: null,
  },
];

afterEach(() => {
  cleanup();
});

function renderForm(
  props: Partial<React.ComponentProps<typeof TransactionForm>> = {},
) {
  const action = vi.fn(async () => undefined);

  const view = render(
    <TransactionForm
      action={action}
      accountOptions={accountOptions}
      categoryOptions={categoryOptions}
      merchantOptions={merchantOptions}
      {...props}
    />,
  );

  return {
    action,
    ...view,
  };
}

function getCombobox(container: HTMLElement, name: string) {
  return within(container).getByRole("combobox", { name });
}

describe("TransactionForm", () => {
  it("传入错误信息时显示 Alert", () => {
    renderForm({ errorMessage: "金额必须为正数，且最多两位小数。" });

    expect(screen.getByText("金额必须为正数，且最多两位小数。")).toBeTruthy();
  });

  it("账户选项中显示币种", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "账户"));

    expect(screen.getByText("日元现金（JPY）")).toBeTruthy();
  });

  it("类型为支出时，只显示支出分类", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "分类"));

    expect(screen.getByText("餐饮")).toBeTruthy();
    expect(screen.queryByText("工资")).toBeNull();
  });

  it("类型切换为收入时，只显示收入分类", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "类型"));
    fireEvent.click(screen.getByText("收入"));

    fireEvent.mouseDown(getCombobox(container, "分类"));

    expect(screen.getByText("工资")).toBeTruthy();
    expect(screen.queryByText("餐饮")).toBeNull();
  });

  it("没有账户时保存按钮不可用", () => {
    const { container } = renderForm({ accountOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
  });

  it("没有当前类型可用分类时保存按钮不可用", () => {
    const { container } = renderForm({ categoryOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
  });

  it("商家选项为空值和商家名称都能显示", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));

    expect(screen.getByText("不选择")).toBeTruthy();
    expect(screen.getByText("便利店")).toBeTruthy();
  });
});
