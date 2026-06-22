import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EditTransactionTemplate,
  NewTransactionTemplate,
} from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    errorMessage,
    formId,
    initialValues,
    ledgerName,
  }: {
    errorMessage: string | null;
    formId?: string;
    initialValues?: { type: string };
    ledgerName?: string;
  }): ReactNode => (
    <form data-testid="transaction-form" id={formId}>
      <h1>新增记账</h1>
      <span data-testid={`${formId}-type`}>
        {initialValues?.type ?? "expense"}
      </span>
      {ledgerName ? <p>当前账本：{ledgerName}</p> : null}
      {errorMessage ? <div role="alert">{errorMessage}</div> : null}
    </form>
  ),
}));

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: ({
    onSubmitDisabledChange,
  }: {
    onSubmitDisabledChange?: (disabled: boolean) => void;
  }): ReactNode => (
    <div data-testid="transfer-transaction-form">
      <button type="button" onClick={() => onSubmitDisabledChange?.(false)}>
        允许保存转账
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  accountOptions: [],
  action: vi.fn(async () => {}),
  categoryOptions: [],
  errorMessage: null,
  ledgerName: "家庭账本",
  merchantOptions: [],
  tagOptions: [],
};

const editProps = {
  ...baseProps,
  accountOptions: [
    {
      currency: "JPY",
      id: "00000000-0000-4000-8000-000000000041",
      name: "现金",
    },
  ],
  categoryOptions: [
    {
      id: "00000000-0000-4000-8000-000000005072",
      name: "餐饮",
      parentId: null,
      parentName: null,
      type: "expense" as const,
    },
    {
      id: "00000000-0000-4000-8000-000000005073",
      name: "工资",
      parentId: null,
      parentName: null,
      type: "income" as const,
    },
  ],
  initialValues: {
    accountId: "00000000-0000-4000-8000-000000000041",
    items: [
      {
        amount: "1200",
        categoryId: "00000000-0000-4000-8000-000000005072",
      },
    ],
    merchantId: "00000000-0000-4000-8000-000000001001",
    note: "晚餐",
    tagNames: [],
    transactionAt: "2026-06-04T10:30:05.000Z",
    transactionRecordId: "00000000-0000-4000-8000-000000009001",
    type: "expense" as const,
  },
  merchantOptions: [
    {
      icon_url: null,
      id: "00000000-0000-4000-8000-000000001001",
      name: "便利店",
    },
  ],
};

describe("NewTransactionTemplate", () => {
  it("显示新增记账页面标题", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getAllByRole("heading", { name: "新增记账" })[0],
    ).toBeInTheDocument();
  });

  it("显示当前账本名称", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getAllByText("当前账本：家庭账本")[0],
    ).toBeInTheDocument();
  });

  it("渲染记账表单", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getAllByTestId("transaction-form")[0],
    ).toBeInTheDocument();
  });

  it("传入错误信息时表单内显示错误提示", () => {
    const { container } = render(
      <NewTransactionTemplate
        {...baseProps}
        errorMessage="新增记账失败。请稍后重试。"
      />,
    );

    expect(within(container).getAllByRole("alert")[0]).toBeInTheDocument();
    expect(
      within(container).getAllByText("新增记账失败。请稍后重试。")[0],
    ).toBeInTheDocument();
  });

  it("仅当前记账类型表单可被辅助技术与指针访问", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);
    const view = within(container);
    const expensePanel = view.getByTestId("expense-transaction-panel");
    const incomePanel = view.getByTestId("income-transaction-panel");
    const transferPanel = view.getByTestId("transfer-transaction-panel");

    expect(expensePanel).toHaveAttribute("aria-hidden", "false");
    expect(expensePanel).not.toHaveAttribute("inert");
    expect(incomePanel).toHaveAttribute("aria-hidden", "true");
    expect(incomePanel).toHaveAttribute("inert");
    expect(transferPanel).toHaveAttribute("aria-hidden", "true");
    expect(transferPanel).toHaveAttribute("inert");

    fireEvent.click(view.getByRole("button", { name: "转账" }));

    expect(expensePanel).toHaveAttribute("aria-hidden", "true");
    expect(expensePanel).toHaveAttribute("inert");
    expect(incomePanel).toHaveAttribute("aria-hidden", "true");
    expect(incomePanel).toHaveAttribute("inert");
    expect(transferPanel).toHaveAttribute("aria-hidden", "false");
    expect(transferPanel).not.toHaveAttribute("inert");
  });

  it("initialType=transfer 时默认打开转账表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="transfer" />,
    );
    const view = within(container);

    expect(view.getByTestId("expense-transaction-panel")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(view.getByTestId("income-transaction-panel")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(view.getByTestId("transfer-transaction-panel")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("转账表单回传可保存时启用顶部保存按钮", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);
    const view = within(container);
    const saveButton = view.getByRole("button", { name: "保存" });

    fireEvent.click(view.getByRole("button", { name: "转账" }));

    expect(saveButton).toBeDisabled();

    fireEvent.click(view.getByRole("button", { name: "允许保存转账" }));

    expect(saveButton).toBeEnabled();
  });
});

describe("EditTransactionTemplate", () => {
  it("编辑普通记账时可以在支出和收入之间切换", () => {
    const { container } = render(<EditTransactionTemplate {...editProps} />);
    const view = within(container);
    const expensePanel = view.getByTestId("edit-expense-transaction-panel");
    const incomePanel = view.getByTestId("edit-income-transaction-panel");

    expect(expensePanel).toHaveAttribute("aria-hidden", "false");
    expect(incomePanel).toHaveAttribute("aria-hidden", "true");
    expect(
      view.getByTestId("edit-expense-transaction-form-type"),
    ).toHaveTextContent("expense");
    expect(
      view.getByTestId("edit-income-transaction-form-type"),
    ).toHaveTextContent("income");

    fireEvent.click(view.getByRole("button", { name: "收入" }));

    expect(expensePanel).toHaveAttribute("aria-hidden", "true");
    expect(incomePanel).toHaveAttribute("aria-hidden", "false");
  });
});
