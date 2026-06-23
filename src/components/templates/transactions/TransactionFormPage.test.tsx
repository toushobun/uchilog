import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    errorMessage,
    initialType,
  }: {
    errorMessage: string | null;
    initialType?: "expense" | "income";
  }): ReactNode => {
    const type = initialType ?? "expense";
    const label = type === "income" ? "收入" : "支出";

    return (
      <div data-testid={`transaction-form-${type}`}>
        <input aria-label={`${label}临时输入`} defaultValue="" />
        <input name="type" type="hidden" value={type} />
        {errorMessage ? <div role="alert">{errorMessage}</div> : null}
      </div>
    );
  },
}));

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: ({
    errorMessage,
  }: {
    errorMessage: string | null;
  }): ReactNode => (
    <div data-testid="transfer-transaction-form">
      <input aria-label="转账临时输入" defaultValue="" />
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
    <div
      aria-label="记账类型"
      data-testid="transaction-type-navigation"
      role="group"
    >
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
  TransactionFormHeader: ({
    ledgerName,
    title,
  }: {
    ledgerName?: string;
    title: string;
  }): ReactNode => (
    <div data-testid="transaction-form-header">
      <h1>{title}</h1>
      {ledgerName ? <p>当前账本：{ledgerName}</p> : null}
      <button type="submit">保存</button>
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

  it("只显示一套包含转账的记账类型导航", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getAllByRole("group", { name: "记账类型" }),
    ).toHaveLength(1);
    expect(
      within(container).getByRole("button", { name: "转账" }),
    ).toBeInTheDocument();
  });

  it("默认激活支出表单并保留其他类型面板", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByTestId("transaction-form-expense"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transaction-form-income"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("initialType=expense 时激活支出表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="expense" />,
    );

    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  it("initialType=income 时激活收入表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="income" />,
    );

    expect(
      within(container).getByTestId("transaction-type-slide-panel-income"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("initialType=transfer 时激活转账表单", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="transfer" />,
    );

    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("点击转账 tab 切换到转账面板", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "转账" }));

    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("点击支出 tab 切换到支出面板", () => {
    const { container } = render(
      <NewTransactionTemplate {...baseProps} initialType="transfer" />,
    );

    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    expect(
      within(container).getByTestId("transaction-type-slide-panel-expense"),
    ).toHaveAttribute("aria-hidden", "false");
    expect(
      within(container).getByTestId("transaction-type-slide-panel-transfer"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("切换类型后保留已挂载表单的输入状态", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.change(within(container).getByLabelText("支出临时输入"), {
      target: { value: "保留支出输入" },
    });
    fireEvent.click(within(container).getByRole("button", { name: "转账" }));
    fireEvent.change(within(container).getByLabelText("转账临时输入"), {
      target: { value: "保留转账输入" },
    });
    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    expect(within(container).getByLabelText("支出临时输入")).toHaveValue(
      "保留支出输入",
    );
  });

  it("传入错误信息时当前表单内显示错误提示", () => {
    const { container } = render(
      <NewTransactionTemplate
        {...baseProps}
        errorMessage="新增记账失败。请稍后重试。"
      />,
    );
    const activePanel = within(container).getByTestId(
      "transaction-type-slide-panel-expense",
    );

    expect(within(activePanel).getByRole("alert")).toBeInTheDocument();
    expect(
      within(activePanel).getByText("新增记账失败。请稍后重试。"),
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
    const activePanel = within(container).getByTestId(
      "transaction-type-slide-panel-transfer",
    );

    expect(activePanel).toHaveAttribute("aria-hidden", "false");
    expect(within(activePanel).getByRole("alert")).toBeInTheDocument();
  });

  it("默认渲染时当前普通表单 hidden type 为 expense", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);
    const activePanel = within(container).getByTestId(
      "transaction-type-slide-panel-expense",
    );

    const hiddenInput = within(activePanel).getByDisplayValue("expense");

    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("点击收入 tab 后当前普通表单 hidden type 变为 income", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));

    const activePanel = within(container).getByTestId(
      "transaction-type-slide-panel-income",
    );
    const hiddenInput = within(activePanel).getByDisplayValue("income");
    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("点击收入 tab 后再点击支出 tab 当前普通表单 hidden type 变回 expense", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    fireEvent.click(within(container).getByRole("button", { name: "收入" }));
    fireEvent.click(within(container).getByRole("button", { name: "支出" }));

    const activePanel = within(container).getByTestId(
      "transaction-type-slide-panel-expense",
    );
    const hiddenInput = within(activePanel).getByDisplayValue("expense");

    expect(hiddenInput).toHaveAttribute("name", "type");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });
});
