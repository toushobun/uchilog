import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TransactionRowItem } from "types/transactions";

import { TransactionRow } from "./TransactionRow";

const originalConfirm = window.confirm;

afterEach(() => {
  cleanup();
  window.confirm = originalConfirm;
});

function createItem(
  overrides: Partial<TransactionRowItem> = {},
): TransactionRowItem {
  return {
    id: "00000000-0000-4000-8000-000000009001",
    type: "expense",
    transaction_at: "2026-06-05T03:20:10.000Z",
    amount: "1234",
    account_name: "日元现金",
    account_currency: "JPY",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    merchant_name: "便利店",
    merchant_icon_url: null,
    note: "测试备注",
    recorder_name: null,
    ...overrides,
  };
}

describe("TransactionRow", () => {
  it("显示商家名称", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.getByText("便利店")).toBeTruthy();
  });

  it("支出记录显示负号金额", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.getByText("-1,234")).toBeTruthy();
  });

  it("收入记录显示正号金额", () => {
    render(
      <TransactionRow
        item={createItem({ type: "income", amount: "260000" })}
      />,
    );

    expect(screen.getByText("+260,000")).toBeTruthy();
  });

  it("showType 为 true 时显示支出标签", () => {
    render(<TransactionRow item={createItem()} showType />);

    expect(screen.getByText("支出")).toBeTruthy();
  });

  it("showType 为 true 时显示收入标签", () => {
    render(<TransactionRow item={createItem({ type: "income" })} showType />);

    expect(screen.getByText("收入")).toBeTruthy();
  });

  it("showNote 为 true 时显示备注", () => {
    render(<TransactionRow item={createItem()} showNote />);

    expect(screen.getByText(/测试备注/)).toBeTruthy();
  });

  it("showNote 为 false 时不显示备注", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByText(/测试备注/)).toBeNull();
  });

  it("showAccount 为 true 时账户名称出现在行内", () => {
    render(<TransactionRow item={createItem()} showAccount />);

    expect(screen.getByText(/日元现金/)).toBeTruthy();
  });

  it("merchant_name 为 null 时显示未指定商家", () => {
    render(<TransactionRow item={createItem({ merchant_name: null })} />);

    expect(screen.getByText("未指定商家")).toBeTruthy();
  });

  it("未传入撤销 action 时不显示撤销按钮", () => {
    render(<TransactionRow item={createItem()} />);

    expect(screen.queryByRole("button", { name: "撤销" })).toBeNull();
  });

  it("传入撤销 action 时显示撤销按钮", () => {
    render(<TransactionRow item={createItem()} voidAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "撤销" })).toBeTruthy();
  });

  it("确认后提交撤销表单并传递记录 id", () => {
    const voidAction = vi.fn();
    window.confirm = vi.fn(() => true);

    render(<TransactionRow item={createItem()} voidAction={voidAction} />);

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));

    expect(voidAction).toHaveBeenCalledTimes(1);
    expect(voidAction.mock.calls[0]?.[0].get("transactionRecordId")).toBe(
      "00000000-0000-4000-8000-000000009001",
    );
  });

  it("取消确认时不提交撤销表单", () => {
    const voidAction = vi.fn();
    window.confirm = vi.fn(() => false);

    render(<TransactionRow item={createItem()} voidAction={voidAction} />);

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));

    expect(voidAction).not.toHaveBeenCalled();
  });
});
