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
  fireEvent.click(screen.getByRole("button", { name: "确定" }));
}

function addItemViaSheet(
  container: HTMLElement,
  categoryName: string,
  amount: string,
) {
  if (!screen.queryByRole("heading", { name: "添加明细" })) {
    openSheet(container);
  }
  fireEvent.click(screen.getByRole("button", { name: categoryName }));
  fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
    target: { value: amount },
  });
  clickSheetAddButton();
}

const trafficCategories = [
  {
    id: "33333333-3333-4333-8333-333333333341",
    name: "电车",
    parentId: "33333333-3333-4333-8333-333333333340",
    parentName: "交通出行",
    type: "expense" as const,
  },
];

describe("TransactionForm regression", () => {
  it("小数明细合计正确舍入显示，不出现浮点精度问题", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet(container, "餐饮", "0.10");
    addItemViaSheet(container, "日用品", "0.20");

    expect(within(container).getByText("合计 - 0.3")).toBeInTheDocument();
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
    expect(container.querySelector('input[name="itemAmount"]')).toHaveValue(
      "0",
    );
  });

  it("分类列表为空时保存按钮不可用", () => {
    const { container } = renderForm({ categoryOptions: [] });

    expect(
      within(container).getByRole("button", { name: "保存记账" }),
    ).toBeDisabled();
  });

  it("编辑已有明细后明细在列表中的顺序不变", () => {
    const { container } = renderForm();

    addItemViaSheet(container, "餐饮", "100");
    addItemViaSheet(container, "日用品", "200");

    const itemInputsBefore = Array.from(
      container.querySelectorAll<HTMLInputElement>(
        'input[name="itemCategoryId"]',
      ),
    ).map((input) => input.value);
    expect(itemInputsBefore[0]).toBe(expenseCategories[0].id);
    expect(itemInputsBefore[1]).toBe(expenseCategories[1].id);

    // 打开第一条明细进行编辑，修改金额（同类型），不改变分类
    fireEvent.click(screen.getByLabelText("编辑明细 1 分类"));
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存修改" }));

    const itemInputsAfter = Array.from(
      container.querySelectorAll<HTMLInputElement>(
        'input[name="itemCategoryId"]',
      ),
    ).map((input) => input.value);
    expect(itemInputsAfter[0]).toBe(expenseCategories[0].id);
    expect(itemInputsAfter[1]).toBe(expenseCategories[1].id);
  });

  it("搜索状态下选择其他大分类的小分类后清空搜索仍显示该大分类", () => {
    const allCategories = [
      ...expenseCategories,
      ...incomeCategories,
      ...trafficCategories,
    ];
    const { container } = renderForm({ categoryOptions: allCategories });

    openSheet(container);

    // 搜索"电车"，命中交通出行大分类
    fireEvent.change(screen.getByRole("textbox", { name: "搜索小分类" }), {
      target: { value: "电车" },
    });

    // 右侧显示的电车按钮存在（交通出行大分类下）
    expect(screen.getByRole("button", { name: "电车" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "电车" }));

    // 清空搜索
    fireEvent.change(screen.getByRole("textbox", { name: "搜索小分类" }), {
      target: { value: "" },
    });

    // 左侧大分类应显示交通出行为选中状态（完全一致名称以避免与快捷分类 chip 冲突）
    expect(
      screen.getByRole("button", { name: "交通出行" }),
    ).toBeInTheDocument();
    // 右侧应仍显示电车（交通出行下的小分类）
    expect(screen.getByRole("button", { name: "电车" })).toBeInTheDocument();
  });
});
