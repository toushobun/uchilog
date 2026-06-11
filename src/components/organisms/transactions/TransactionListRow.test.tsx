import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionListRow } from "./TransactionListRow";

afterEach(() => {
  cleanup();
});

function createItem(overrides = {}) {
  return {
    id: "00000000-0000-4000-8000-000000009001",
    type: "expense" as const,
    transaction_at: "2026-06-05T03:20:10.000Z",
    amount: "1234",
    account_name: "日元现金",
    account_currency: "JPY",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    merchant_name: "便利店",
    merchant_icon_url: null,
    note: null,
    recorder_name: null,
    created_at: "2026-06-05T03:20:10.000Z",
    ...overrides,
  };
}

describe("TransactionListRow", () => {
  it("支出记录显示支出标签", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("支出")).toBeTruthy();
  });

  it("收入记录显示收入标签", () => {
    render(<TransactionListRow item={createItem({ type: "income" })} />);

    expect(screen.getByText("收入")).toBeTruthy();
  });

  it("显示商家名称", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("便利店")).toBeTruthy();
  });

  it("显示账户名称", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText(/日元现金/)).toBeTruthy();
  });

  it("显示分类标签（含父分类）", () => {
    render(<TransactionListRow item={createItem()} />);

    // 父分类·子分类 格式
    expect(screen.getByText("饮食·餐饮")).toBeTruthy();
  });

  it("支出金额显示负号格式", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("-1,234 JPY")).toBeTruthy();
  });

  it("收入金额显示正号格式", () => {
    render(
      <TransactionListRow
        item={createItem({ type: "income", amount: "120000" })}
      />,
    );

    expect(screen.getByText("+120,000 JPY")).toBeTruthy();
  });

  it("有备注时显示备注内容", () => {
    render(<TransactionListRow item={createItem({ note: "测试备注" })} />);

    expect(screen.getByText("测试备注")).toBeTruthy();
  });

  it("无备注时不显示备注区域", () => {
    render(<TransactionListRow item={createItem({ note: null })} />);

    expect(screen.queryByText("测试备注")).toBeNull();
  });

  it("传入 voidAction 时显示撤销按钮", () => {
    render(<TransactionListRow item={createItem()} voidAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "撤销" })).toBeTruthy();
  });

  it("未传入 voidAction 时不显示撤销按钮", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.queryByRole("button", { name: "撤销" })).toBeNull();
  });
});
