import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    initialValues,
  }: {
    initialValues: { type: "expense" | "income" };
  }): ReactNode => {
    const label = initialValues.type === "income" ? "收入" : "支出";

    return (
      <form>
        <div data-testid={`transaction-form-${initialValues.type}`}>
          <input aria-label={`${label}编辑临时输入`} defaultValue="" />
          <input name="type" type="hidden" value={initialValues.type} />
        </div>
      </form>
    );
  },
}));

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: (): ReactNode => (
    <div data-testid="transfer-transaction-form">
      <input aria-label="转账编辑临时输入" defaultValue="" />
    </div>
  ),
}));

vi.mock("molecules/transactions/TransactionTypeNavigation", () => ({
  TransactionTypeNavigation: ({
    activeType,
    onChange,
  }: {
    activeType: string;
    onChange: (type: string) => void;
  }): ReactNode => (
    <div aria-label="类型" role="group">
      <button
        onClick={() => onChange("expense")}
        aria-pressed={activeType === "expense"}
      >
        支出
      </button>
      <button
        onClick={() => onChange("income")}
        aria-pressed={activeType === "income"}
      >
        收入
      </button>
      <button
        onClick={() => onChange("transfer")}
        aria-pressed={activeType === "transfer"}
      >
        转账
      </button>
    </div>
  ),
}));

vi.mock("organisms/transactions/TransactionAmountKeypadLauncher", () => ({
  TransactionAmountKeypadLauncher: (): ReactNode => null,
}));

vi.mock("organisms/transactions/TransactionFormHeader", () => ({
  TransactionFormHeader: ({ title }: { title: string }): ReactNode => (
    <div data-testid="transaction-form-header">
      <h1>{title}</h1>
      <button type="submit">保存</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

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
];

const merchantOptions = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "便利店",
    icon_url: null,
  },
];

function createProps(type: "expense" | "income" = "expense") {
  return {
    accountOptions,
    action: vi.fn(async () => undefined),
    categoryOptions,
    errorMessage: null,
    initialValues: {
      accountId: accountOptions[0].id,
      items: [
        {
          amount: "1200",
          categoryId: categoryOptions[0].id,
        },
      ],
      merchantId: merchantOptions[0].id,
      note: "编辑前备注",
      tagNames: [],
      transactionAt: "2026-06-05T03:20:10.000Z",
      transactionRecordId: "00000000-0000-4000-8000-000000009001",
      type,
    },
    ledgerName: "家庭账本",
    merchantOptions,
    tagOptions: [],
  };
}

describe("EditTransactionTemplate", () => {
  it("普通支出编辑页只渲染一套支出 / 收入 / 转账切换", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    expect(
      within(container).getAllByRole("button", { name: "支出" }),
    ).toHaveLength(1);
    expect(
      within(container).getByRole("button", { name: "支出" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(container).getAllByRole("button", { name: "收入" }),
    ).toHaveLength(1);
    expect(
      within(container).getByRole("button", { name: "收入" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(container).getAllByRole("button", { name: "转账" }),
    ).toHaveLength(1);
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  it("普通收入编辑页只渲染一套支出 / 收入 / 转账切换", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps("income")} />,
    );

    expect(
      within(container).getAllByRole("button", { name: "支出" }),
    ).toHaveLength(1);
    expect(
      within(container).getByRole("button", { name: "支出" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(container).getAllByRole("button", { name: "收入" }),
    ).toHaveLength(1);
    expect(
      within(container).getByRole("button", { name: "收入" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(container).getAllByRole("button", { name: "转账" }),
    ).toHaveLength(1);
    expect(
      within(container).getByTestId("transaction-type-slide-panel-income"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  it("普通编辑页显示转账切换 tab", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    expect(
      within(container).getByRole("button", { name: "转账" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(container).getByTestId("transaction-form-expense"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
  });

  it("点击转账 tab 后激活转账编辑面板", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    fireEvent.click(within(container).getByRole("button", { name: "转账" }));

    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("普通编辑切换类型后保留已挂载表单输入状态", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    fireEvent.change(within(container).getByLabelText("支出编辑临时输入"), {
      target: { value: "保留普通编辑输入" },
    });
    fireEvent.click(within(container).getByRole("button", { name: "转账" }));
    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    expect(within(container).getByLabelText("支出编辑临时输入")).toHaveValue(
      "保留普通编辑输入",
    );
  });
});
