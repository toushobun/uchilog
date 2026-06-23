import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditTransferTransactionTemplate } from "./TransactionFormPage";

vi.mock("organisms/transactions/TransferTransactionForm", () => ({
  TransferTransactionForm: (): ReactNode => (
    <div data-testid="transfer-transaction-form">
      <h1>编辑转账</h1>
    </div>
  ),
}));

vi.mock("organisms/transactions/TransactionAmountKeypadLauncher", () => ({
  TransactionAmountKeypadLauncher: (): ReactNode => null,
}));

afterEach(() => {
  cleanup();
});

describe("EditTransferTransactionTemplate", () => {
  it("转账编辑页仍渲染转账编辑表单", () => {
    const { container } = render(
      <EditTransferTransactionTemplate
        accountOptions={[
          {
            id: "00000000-0000-4000-8000-000000000045",
            name: "日元现金",
            currency: "JPY",
          },
        ]}
        action={vi.fn(async () => undefined)}
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
      />,
    );

    expect(
      within(container).getByTestId("transfer-transaction-form"),
    ).toBeInTheDocument();
    expect(
      within(container).queryByRole("button", { name: "支出" }),
    ).toBeNull();
    expect(
      within(container).queryByRole("button", { name: "收入" }),
    ).toBeNull();
  });
});
