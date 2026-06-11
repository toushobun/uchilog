import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routePaths } from "config/paths";

import { TransactionForm } from "./TransactionForm";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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
  it("显示移动端记账顶部操作区", () => {
    const { container } = renderForm({ ledgerName: "家庭账本" });

    expect(
      within(container).getByRole("heading", { name: "新增记账" }),
    ).toBeTruthy();
    expect(
      within(container)
        .getByRole("link", { name: "关闭" })
        .getAttribute("href"),
    ).toBe(routePaths.transactions);
    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toBeTruthy();
    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
  });

  it("未传入账本名时不显示当前账本", () => {
    const { container } = renderForm();

    expect(within(container).queryByText(/^当前账本：/)).toBeNull();
  });

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

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));

    fireEvent.mouseDown(getCombobox(container, "分类"));

    expect(screen.getByText("工资")).toBeTruthy();
    expect(screen.queryByText("餐饮")).toBeNull();
  });

  it("保存前汇总会显示当前表单摘要", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));
    fireEvent.click(screen.getByText("便利店"));

    fireEvent.mouseDown(getCombobox(container, "账户"));
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    fireEvent.mouseDown(getCombobox(container, "分类"));
    fireEvent.click(screen.getByText("餐饮"));

    fireEvent.change(within(container).getByRole("textbox", { name: /金额/ }), {
      target: { value: "1200" },
    });

    expect(within(container).getByText("保存前汇总")).toBeTruthy();
    expect(within(container).getAllByText("便利店")).toHaveLength(2);
    expect(within(container).getAllByText("日元现金（JPY）")).toHaveLength(2);
    expect(within(container).getByText("餐饮 / 1200")).toBeTruthy();
    expect(within(container).getByText("合计金额")).toBeTruthy();
  });

  it("显示设计图中的标签区但不提供未保存的交互", () => {
    const { container } = renderForm();

    expect(within(container).getByText("标签（选填）")).toBeTruthy();
    expect(within(container).getByText("日常")).toBeTruthy();
    expect(within(container).getByText("腐败")).toBeTruthy();
    expect(within(container).getByText("公司")).toBeTruthy();
    expect(within(container).getByText("人情")).toBeTruthy();
    expect(within(container).getByText("孩子")).toBeTruthy();
    expect(within(container).getByText("旅游")).toBeTruthy();
    expect(within(container).getByText("装修")).toBeTruthy();
    expect(within(container).getByText("结婚")).toBeTruthy();
    expect(
      within(container).queryByRole("button", { name: "日常" }),
    ).toBeNull();
  });

  it("发生时间下面显示保存记账按钮", () => {
    const { container } = renderForm();

    const transactionAt = within(container).getByLabelText(/发生时间/);
    const submitButton = within(container).getByRole("button", {
      name: "保存记账",
    });

    expect(transactionAt.compareDocumentPosition(submitButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(submitButton).toHaveProperty("type", "submit");
  });

  it("没有账户时保存按钮不可用", () => {
    const { container } = renderForm({ accountOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toHaveProperty("disabled", true);
  });

  it("没有当前类型可用分类时保存按钮不可用", () => {
    const { container } = renderForm({ categoryOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toHaveProperty("disabled", true);
  });

  it("商家选项为空值和商家名称都能显示", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));

    expect(screen.getByText("不选择")).toBeTruthy();
    expect(screen.getByText("便利店")).toBeTruthy();
  });
});
