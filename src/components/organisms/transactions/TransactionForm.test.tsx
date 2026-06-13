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
import {
  newTransactionPageErrorMessages,
  transactionFormValidationMessages,
} from "utils/transactionMessages";

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
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005074",
    name: "日用品",
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005075",
    name: "电车",
    parentId: "00000000-0000-4000-8000-000000005002",
    parentName: "交通出行",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "工资",
    parentId: "00000000-0000-4000-8000-000000005003",
    parentName: "固定收入",
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

function openSheet(container: HTMLElement) {
  fireEvent.click(
    within(container).getByRole("button", { name: "+ 添加一项明细" }),
  );
}

function addItemViaSheet(categoryName: string, amount: string) {
  fireEvent.click(screen.getByRole("button", { name: categoryName }));
  fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
    target: { value: amount },
  });
  fireEvent.click(screen.getByRole("button", { name: "追加" }));
}

function formatExpectedDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000`;
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
    renderForm({ errorMessage: newTransactionPageErrorMessages.amountInvalid });

    expect(
      screen.getByText(newTransactionPageErrorMessages.amountInvalid),
    ).toBeTruthy();
  });

  it("编辑模式下按本地时区回填发生时间", () => {
    const transactionAt = "2026-06-05T03:20:10.000Z";
    const { container } = renderForm({
      initialValues: {
        accountId: accountOptions[0].id,
        items: [
          {
            amount: "1200",
            categoryId: categoryOptions[0].id,
          },
        ],
        merchantId: merchantOptions[0].id,
        note: "",
        transactionAt,
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        type: "expense",
      },
    });

    expect(
      (within(container).getByLabelText(/发生时间/) as HTMLInputElement).value,
    ).toBe(formatExpectedDateTimeLocalValue(transactionAt));
  });

  it("账户选项中显示币种", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "账户"));

    expect(screen.getByText("日元现金（JPY）")).toBeTruthy();
  });

  it("打开弹框时只显示当前类型的大分类和小分类（支出）", () => {
    const { container } = renderForm();

    openSheet(container);

    expect(screen.getByRole("heading", { name: "添加明细" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "食材/调料" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "交通出行" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "餐饮" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "日用品" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "固定收入" })).toBeNull();
    expect(screen.queryByRole("button", { name: "工资" })).toBeNull();
  });

  it("类型切换为收入时，弹框只显示收入大分类和小分类", () => {
    const { container } = renderForm();

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));
    openSheet(container);

    expect(screen.getByRole("button", { name: "固定收入" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "工资" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "食材/调料" })).toBeNull();
    expect(screen.queryByRole("button", { name: "餐饮" })).toBeNull();
  });

  it("切换大分类后右侧显示对应的小分类", () => {
    const { container } = renderForm();

    openSheet(container);

    fireEvent.click(screen.getByRole("button", { name: "交通出行" }));

    expect(screen.getByRole("button", { name: "电车" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "餐饮" })).toBeNull();
  });

  it("点击小分类 Chip 后可追加，未选分类直接点追加会提示错误", () => {
    const { container } = renderForm();

    openSheet(container);

    // 选中分类、填金额、追加 —— 成功，无错误
    fireEvent.click(screen.getByRole("button", { name: "餐饮" }));
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(
      screen.queryByText(transactionFormValidationMessages.categoryRequired),
    ).toBeNull();

    // 追加后 Drawer 还在，picker 已清空；不选分类直接填金额再追加
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(
      screen.getByText(transactionFormValidationMessages.categoryRequired),
    ).toBeTruthy();
  });

  it("未选小分类时点击追加显示错误提示", () => {
    const { container } = renderForm();

    openSheet(container);
    fireEvent.change(screen.getByRole("textbox", { name: "金额" }), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(
      screen.getByText(transactionFormValidationMessages.categoryRequired),
    ).toBeTruthy();
  });

  it("打开添加明细时金额默认是 0，并可直接追加 0 元明细", () => {
    const { container } = renderForm();

    openSheet(container);
    expect(screen.getByRole("textbox", { name: "金额" })).toHaveProperty(
      "value",
      "0",
    );

    fireEvent.click(screen.getByRole("button", { name: "餐饮" }));
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(
      screen.queryByText(transactionFormValidationMessages.amountInvalid),
    ).toBeNull();
    expect(screen.getByText("已选明细")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "金额" })).toHaveProperty(
      "value",
      "0",
    );
  });

  it("追加后 Chip 被清空且金额输入框回到 0，明细出现在已选列表", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "500");

    expect(screen.getByText("已选明细")).toBeTruthy();
    // 追加后同时出现在 Drawer 已选区和主表单，各一条
    expect(screen.getAllByText("食材/调料 / 餐饮")).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "金额" })).toHaveProperty(
      "value",
      "0",
    );
  });

  it("可以连续追加多条明细，合计同步更新", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "286");
    addItemViaSheet("日用品", "45");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("共 2 项")).toBeTruthy();
    expect(within(container).getByText("合计 -331")).toBeTruthy();
  });

  it("小数明细合计正确舍入显示，不出现浮点精度问题", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "0.10");
    addItemViaSheet("日用品", "0.20");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("合计 -0.3")).toBeTruthy();
  });

  it("允许追加 0 元明细，并显示 0 合计", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "0");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("食材/调料 / 餐饮")).toBeTruthy();
    expect(within(container).getByText("合计 0")).toBeTruthy();
  });

  it("允许同一个小分类重复追加为多条明细", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "500");
    addItemViaSheet("餐饮", "300");

    // Drawer 已选区有 2 条独立删除按钮
    expect(
      screen.getAllByRole("button", { name: /从已选中删除/ }),
    ).toHaveLength(2);
    // 主表单（getByText 不受 aria-hidden 限制）显示 2 项
    expect(within(container).getByText("共 2 项")).toBeTruthy();
  });

  it("已有多条明细时可删除，删到最后一条仍可继续删除", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "286");
    addItemViaSheet("日用品", "45");

    // 在 Drawer 已选区删除第二条
    fireEvent.click(
      screen.getByRole("button", { name: "从已选中删除 日用品" }),
    );

    expect(within(container).getByText("共 1 项")).toBeTruthy();
    // 只剩一条时删除按钮仍然可用
    expect(
      screen.getByRole("button", { name: "从已选中删除 餐饮" }),
    ).toHaveProperty("disabled", false);

    // 再删最后一条，明细清空
    fireEvent.click(screen.getByRole("button", { name: "从已选中删除 餐饮" }));
    expect(within(container).queryByText("共 1 项")).toBeNull();
  });

  it("弹框内的已选列表也可删除明细", () => {
    const { container } = renderForm();

    openSheet(container);
    addItemViaSheet("餐饮", "286");
    addItemViaSheet("日用品", "45");

    fireEvent.click(
      screen.getByRole("button", { name: "从已选中删除 日用品" }),
    );

    expect(screen.queryByText("食材/调料 / 日用品")).toBeNull();
    expect(within(container).getByText("共 1 项")).toBeTruthy();
  });

  it("保存前汇总显示商家、账户和各条明细", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));
    fireEvent.click(screen.getByText("便利店"));

    fireEvent.mouseDown(getCombobox(container, "账户"));
    fireEvent.click(screen.getByText("日元现金（JPY）"));

    openSheet(container);
    addItemViaSheet("餐饮", "1200");
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(within(container).getByText("保存前汇总")).toBeTruthy();
    expect(within(container).getAllByText("便利店")).toHaveLength(2);
    expect(within(container).getAllByText("日元现金（JPY）")).toHaveLength(2);
    expect(within(container).getByText("食材/调料 / 餐饮 / 1200")).toBeTruthy();
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

  it("商家下拉显示占位项和商家名称", () => {
    const { container } = renderForm();

    fireEvent.mouseDown(getCombobox(container, "商家"));

    expect(screen.getByText("请选择商家")).toBeTruthy();
    expect(screen.getByText("便利店")).toBeTruthy();
  });
});
