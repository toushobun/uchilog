import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccountRow } from "types/accounts";

import { AccountList } from "./AccountList";

vi.mock("molecules/accounts/ArchiveAccountButton", () => ({
  ArchiveAccountButton: (): ReactNode => (
    <button type="submit">归档账户</button>
  ),
}));

vi.mock("./AccountEditForm", () => ({
  AccountEditForm: (): ReactNode => <div data-testid="account-edit-form" />,
}));

afterEach(() => {
  cleanup();
});

const baseAccount: AccountRow = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "三菱UFJ银行",
  type: "bank",
  currency: "JPY",
  initial_balance: 100000,
  current_balance: 85000,
  sort_order: 1,
  created_at: "2026-01-01T00:00:00.000Z",
  holders: [],
};

const baseProps = {
  accounts: [],
  archiveAccountAction: vi.fn(async () => {}),
  holderOptions: [],
  updateAccountAction: vi.fn(async () => {}),
};

describe("AccountList", () => {
  it("没有账户时显示空状态提示", () => {
    const { container } = render(<AccountList {...baseProps} />);

    expect(within(container).getByText("还没有账户")).toBeInTheDocument();
  });

  it("有账户时显示账户名称", () => {
    const { container } = render(
      <AccountList {...baseProps} accounts={[baseAccount]} />,
    );

    expect(within(container).getByText("三菱UFJ银行")).toBeInTheDocument();
  });

  it("有多个账户时全部显示", () => {
    const account2: AccountRow = {
      ...baseAccount,
      id: "00000000-0000-4000-8000-000000000002",
      name: "PayPay",
      type: "e_money",
      sort_order: 2,
    };
    const { container } = render(
      <AccountList {...baseProps} accounts={[baseAccount, account2]} />,
    );

    expect(within(container).getByText("三菱UFJ银行")).toBeInTheDocument();
    expect(within(container).getByText("PayPay")).toBeInTheDocument();
  });
});
