import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    initialValues,
  }: {
    initialValues: { type: "expense" | "income" };
  }): ReactNode => (
    <div data-testid="transaction-form">
      <input name="type" type="hidden" value={initialValues.type} />
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
  it("普通支出编辑页渲染支出 / 收入切换", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps()} />,
    );

    expect(
      within(container).getByRole("button", { name: "支出" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(container).getByRole("button", { name: "收入" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("普通收入编辑页渲染支出 / 收入切换", () => {
    const { container } = render(
      <EditTransactionTemplate {...createProps("income")} />,
    );

    expect(
      within(container).getByRole("button", { name: "支出" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(container).getByRole("button", { name: "收入" }),
    ).toHaveAttribute("aria-pressed", "true");
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
