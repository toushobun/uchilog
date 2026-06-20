import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { transactionFormValidationMessages } from "utils/transactionMessages";

import { TransactionForm } from "./TransactionForm";

const accountOptions = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "日元现金",
    currency: "JPY",
  },
];

const merchantOptions = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "便利店",
    icon_url: null,
  },
];

const expenseCategories = [
  {
    id: "33333333-3333-4333-8333-333333333331",
    name: "餐饮",
    parentId: "33333333-3333-4333-8333-333333333330",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "33333333-3333-4333-8333-333333333332",
    name: "日用品",
    parentId: "33333333-3333-4333-8333-333333333330",
    parentName: "食材/调料",
    type: "expense" as const,
  },
];

const incomeCategories = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    name: "工资",
    parentId: "44444444-4444-4444-8444-444444444440",
    parentName: "固定收入",
    type: "income" as const,
  },
];

const tagOptions = [
  { id: "55555555-5555-4555-8555-555555555555", name: "日常", color: null },
];

afterEach(() => cleanup());

function renderForm(
  props: Partial<React.ComponentProps<typeof TransactionForm>> = {},
) {
  return render(
    <TransactionForm
      action={vi.fn(async () => undefined)}
      accountOptions={accountOptions}
      categoryOptions={[...expenseCategories, ...incomeCategories]}
      merchantOptions={merchantOptions}
      tagOptions={tagOptions}
      {...props}
    />,
  );
}

function openSheet(container: HTMLElement) {
  fireEvent.click(within(container).getByRole("button", { name: "添加明细" }));
}

function clickSheetAddButton() {
  const button = screen.getAllByRole("button", { name: "追加" }).at(-1);

  if (!button) throw new Error("明细追加按钮不存在");

  fireEvent.click(button);
}

function addItemViaSheet(categoryName: string, amount: string) {
  fireEvent.click(screen.getByRole("button", { name: categoryName }));
  fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
    target: { value: amount },
  });
  clickSheetAddButton();
}

describe("TransactionForm regression", () => {
  it("小数明细合计正确舍入显示，不出现浮点精度问题", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "0.10");
    addItemViaSheet("日用品", "0.20");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("合计 -0.3")).toBeInTheDocument();
  });

  it("打开添加明细时金额默认是空，显式输入 0 可追加", () => {
    const { container } = renderForm();

    openSheet(container);
    expect(screen.getByRole("textbox", { name: "金额" })).toHaveProperty(
      "value",
      "",
    );

    fireEvent.click(screen.getByRole("button", { name: "餐饮" }));
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "0" },
    });
    clickSheetAddButton();

    expect(
      screen.queryByText(transactionFormValidationMessages.amountInvalid),
    ).toBeNull();
    expect(screen.getByText("已选明细")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "金额" })).toHaveProperty(
      "value",
      "",
    );
  });

  it("没有当前类型可用分类时保存按钮不可用", () => {
    const { container } = renderForm({ categoryOptions: incomeCategories });

    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toBeDisabled();
  });
});
