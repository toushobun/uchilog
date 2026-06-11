import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewTransactionTemplate } from "./NewTransaction";

vi.mock("organisms/transactions/TransactionForm", () => ({
  TransactionForm: ({
    errorMessage,
  }: {
    errorMessage: string | null;
  }): ReactNode => (
    <div data-testid="transaction-form">
      {errorMessage ? <div role="alert">{errorMessage}</div> : null}
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
};

describe("NewTransactionTemplate", () => {
  it("显示新增记录页面标题", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "新增记录" }),
    ).toBeTruthy();
  });

  it("显示当前账本名称", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
  });

  it("渲染记账表单", () => {
    const { container } = render(<NewTransactionTemplate {...baseProps} />);

    expect(within(container).getByTestId("transaction-form")).toBeTruthy();
  });

  it("传入错误信息时表单内显示错误提示", () => {
    const { container } = render(
      <NewTransactionTemplate
        {...baseProps}
        errorMessage="新增记账失败。请稍后重试。"
      />,
    );

    expect(within(container).getByRole("alert")).toBeTruthy();
    expect(
      within(container).getByText("新增记账失败。请稍后重试。"),
    ).toBeTruthy();
  });
});
