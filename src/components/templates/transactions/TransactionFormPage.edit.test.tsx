import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    initialValues,
    typeNavigation,
  }: {
    initialValues: { type: "expense" | "income" };
    typeNavigation?: ReactNode;
  }): ReactNode => (
    <form>
      {typeNavigation}
      <div data-testid="transaction-form">
        <input name="type" type="hidden" value={initialValues.type} />
      </div>
    </form>
  ),
}));

vi.mock("molecules/transactions/TransactionTypeNavigation", () => ({
  TransactionTypeNavigation: ({
    activeType,
  }: {
    activeType: string;
  }): ReactNode => (
    <div aria-label="类型" role="group">
      <button aria-pressed={activeType === "expense"}>支出</button>
      <button aria-pressed={activeType === "income"}>收入</button>
      <button aria-pressed={activeType === "transfer"}>转账</button>
    </div>
  ),
}));

vi.mock("organisms/transactions/TransactionAmountKeypadLauncher", () => ({
  TransactionAmountKeypadLauncher: (): ReactNode => null,
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
  });

  it("普通编辑页显示转账切换 tab", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    expect(
      within(container).getByRole("button", { name: "转账" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(container).getByTestId("transaction-form"),
    ).toBeInTheDocument();
  });
});
