import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditTransferTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    formId,
    initialValues,
  }: {
    formId: string;
    initialValues: { type: "expense" | "income" };
  }): ReactNode => {
    const label = initialValues.type === "income" ? "收入" : "支出";

    return (
      <form data-testid={`transaction-form-${initialValues.type}`} id={formId}>
        <input aria-label={`${label}转换临时输入`} defaultValue="" />
      </form>
    );
  },
}));

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: ({ formId }: { formId: string }): ReactNode => (
    <form data-testid="transfer-transaction-form" id={formId}>
      <input aria-label="转账转换临时输入" defaultValue="" />
    </form>
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
  vi.restoreAllMocks();
});

function renderTemplate() {
  return render(
    <EditTransferTransactionTemplate
      accountOptions={[
        {
          id: "00000000-0000-4000-8000-000000000045",
          name: "日元现金",
          currency: "JPY",
        },
      ]}
      action={vi.fn(async () => undefined)}
      categoryOptions={[]}
      errorMessage={null}
      initialValues={{
        accountId: "00000000-0000-4000-8000-000000000045",
        note: "",
        transactionAt: "2026-06-05T03:20:10.000Z",
        transactionRecordId: "00000000-0000-4000-8000-000000009002",
        transferAmount: "5000",
        transferTargetAccountId: "00000000-0000-4000-8000-000000000046",
        type: "transfer",
      }}
      ledgerName="家庭账本"
      merchantOptions={[]}
      tagOptions={[]}
    />,
  );
}

describe("EditTransferTransactionTemplate", () => {
  it("转账编辑页默认激活转账编辑表单，并显示编辑记账标题", () => {
    const { container } = renderTemplate();

    expect(
      within(container).getByRole("heading", { name: "编辑记账" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transaction-form-expense"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transaction-form-income"),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "收支" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "转账" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  it("转账编辑页点击收支 tab 后激活支出转换面板", () => {
    const { container } = renderTemplate();

    fireEvent.click(within(container).getByRole("button", { name: "收支" }));

    expect(
      within(container).getByRole("heading", { name: "编辑记账" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("转账编辑切换类型后保留已挂载表单输入状态", () => {
    const { container } = renderTemplate();

    fireEvent.change(within(container).getByLabelText("转账转换临时输入"), {
      target: { value: "保留转账编辑输入" },
    });
    fireEvent.click(within(container).getByRole("button", { name: "收支" }));
    fireEvent.click(within(container).getByRole("button", { name: "转账" }));

    expect(within(container).getByLabelText("转账转换临时输入")).toHaveValue(
      "保留转账编辑输入",
    );
  });

  it("转账内容修改后退出时显示未保存提示", () => {
    const { container } = renderTemplate();

    fireEvent.change(within(container).getByLabelText("转账转换临时输入"), {
      target: { value: "已修改" },
    });
    fireEvent.click(within(container).getByRole("button", { name: "关闭" }));

    expect(
      screen.getByText("修正的内容尚未保存，是否保存？"),
    ).toBeInTheDocument();
  });
});
