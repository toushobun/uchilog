import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountsTemplate } from "./Accounts";

afterEach(() => {
  cleanup();
});

const baseProps = {
  accounts: [],
  archiveAccountAction: vi.fn(async () => {}),
  baseCurrency: "JPY",
  createAccountAction: vi.fn(async () => {}),
  errorMessage: null,
  holderOptions: [],
  ledgerName: "家庭账本",
  updateAccountAction: vi.fn(async () => {}),
};

describe("AccountsTemplate", () => {
  it("显示账户页面标题", () => {
    const { container } = render(<AccountsTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "账户" }),
    ).toBeInTheDocument();
  });

  it("显示当前账本名称", () => {
    const { container } = render(<AccountsTemplate {...baseProps} />);

    expect(
      within(container).getByText("当前账本：家庭账本"),
    ).toBeInTheDocument();
  });

  it("传入错误信息时显示错误提示", () => {
    const { container } = render(
      <AccountsTemplate {...baseProps} errorMessage="账户新增失败。" />,
    );

    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(within(container).getByText("账户新增失败。")).toBeInTheDocument();
  });

  it("无错误信息时不显示错误提示", () => {
    const { container } = render(<AccountsTemplate {...baseProps} />);

    expect(within(container).queryByRole("alert")).toBeNull();
  });

  it("没有账户时显示空状态提示", () => {
    const { container } = render(<AccountsTemplate {...baseProps} />);

    expect(within(container).getByText("还没有账户")).toBeInTheDocument();
  });

  it("显示新增账户表单标题", () => {
    const { container } = render(<AccountsTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "新增账户" }),
    ).toBeInTheDocument();
  });
});
