import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    errorMessage,
    initialType,
    ledgerName,
  }: {
    errorMessage: string | null;
    initialType?: string;
    ledgerName?: string;
  }): ReactNode => (
    <div data-testid="transaction-form">
      <h1>新增记账</h1>
      <input name="type" type="hidden" value={initialType ?? "expense"} />
      {ledgerName ? <p>当前账本：{ledgerName}</p> : null}
      {errorMessage ? <div role="alert">{errorMessage}</div> : null}
    </div>
  ),
}));

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: ({
    errorMessage,
    ledgerName,
  }: {
    errorMessage: string | null;
    ledgerName?: string;
  }): ReactNode => (
    <div data-testid="transfer-transaction-form">
      <h1>新增记账</h1>
      {ledgerName ? <p>当前账本：{ledgerName}</p> : null}
      {errorMessage ? <div role="alert">{errorMessage}</div> : null}
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
    <div data-testid="transaction-type-navigation">
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

describe("NewTransactionTemplate", () => {
  it("显示新增记账页面标题", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "新增记账" }),
    ).toBeInTheDocument();
  });

  it("显示当前账本名称", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByText("当前账本：家庭账本"),
    ).toBeInTheDocument();
  });

  it("渲染记账类型导航", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByTestId("transaction-type-navigation"),
    ).toBeInTheDocument();
  });

  it("默认渲染支出表单", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByTestId("transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transfer-transaction-form"),
    ).toBeNull();
  });

  it("initialType=expense 时渲染支出表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="expense" />,
    );

    expect(
      within(container).getByTestId("transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transfer-transaction-form"),
    ).toBeNull();
  });

  it("initialType=income 时渲染收入表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="income" />,
    );

    expect(
      within(container).getByTestId("transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transfer-transaction-form"),
    ).toBeNull();
  });

  it("initialType=transfer 时渲染转账表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="transfer" />,
    );

    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(within(container).queryByTestId("transaction-form")).toBeNull();
  });

  it("点击转账 tab 切换到转账表单", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "转账" }));

    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(within(container).queryByTestId("transaction-form")).toBeNull();
  });

  it("点击支出 tab 切换到支出表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="transfer" />,
    );

    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    expect(
      within(container).getByTestId("transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).queryByTestId("transfer-transaction-form"),
    ).toBeNull();
  });

  it("传入错误信息时表单内显示错误提示", () => {
    const { container } = render(
      <NewTransactionTemplate
        {...baseProps}
        errorMessage="新增记账失败。请稍后重试。"
      />,
    );

    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(
      within(container).getByText("新增记账失败。请稍后重试。"),
    ).toBeInTheDocument();
  });

  it("transfer 类型且带错误信息时保持转账表单", () => {
    const { container } = render(
      <NewTransactionTemplate
        {...baseProps}
        initialType="transfer"
        errorMessage="转账失败。请稍后重试。"
      />,
    );

    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(within(container).getByRole("alert")).toBeInTheDocument();
  });

  it("默认渲染时普通表单 hidden type 为 expense", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    const hiddenInput = within(container).getByDisplayValue("expense");

    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("点击外层收入 tab 后普通表单 hidden type 变为 income", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));

    const hiddenInput = within(container).getByDisplayValue("income");

    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("点击外层收入 tab 后再点击支出 tab 普通表单 hidden type 变回 expense", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));
    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    const hiddenInput = within(container).getByDisplayValue("expense");

    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });
});
