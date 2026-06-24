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
    tagNames: [],
    created_at: "2026-06-05T03:20:10.000Z",
    ...overrides,
  };
}

describe("TransactionListRow", () => {
  it("支出记录显示支出标签", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("支出")).toBeInTheDocument();
  });

  it("收入记录显示收入标签", () => {
    render(<TransactionListRow item={createItem({ type: "income" })} />);

    expect(screen.getByText("收入")).toBeInTheDocument();
  });

  it("显示商家名称", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("便利店")).toBeInTheDocument();
  });

  it("显示账户名称", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText(/日元现金/)).toBeInTheDocument();
  });

  it("显示分类标签（含父分类）", () => {
    render(<TransactionListRow item={createItem()} />);

    // 父分类·子分类 格式
    expect(screen.getByText("饮食·餐饮")).toBeInTheDocument();
  });

  it("支出金额显示负号格式", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.getByText("-1,234 JPY")).toBeInTheDocument();
  });

  it("收入金额显示正号格式", () => {
    render(
      <TransactionListRow
        item={createItem({ type: "income", amount: "120000" })}
      />,
    );

    expect(screen.getByText("+120,000 JPY")).toBeInTheDocument();
  });

  it("有备注时显示备注内容", () => {
    render(<TransactionListRow item={createItem({ note: "测试备注" })} />);

    expect(screen.getByText("测试备注")).toBeInTheDocument();
  });

  it("无备注时不显示备注区域", () => {
    render(<TransactionListRow item={createItem({ note: null })} />);

    expect(screen.queryByText("测试备注")).toBeNull();
  });

  it("传入 voidAction 时显示删除按钮", () => {
    render(<TransactionListRow item={createItem()} voidAction={vi.fn()} />);

    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
  });

  it("未传入 voidAction 时不显示删除按钮", () => {
    render(<TransactionListRow item={createItem()} />);

    expect(screen.queryByRole("button", { name: "删除" })).toBeNull();
  });

  it("转账记录显示转账标签", () => {
    render(
      <TransactionListRow
        item={createItem({
          type: "transfer",
          merchant_name: null,
          categoryItems: [],
          account_name: "日元现金 → 储蓄账户",
        })}
      />,
    );

    expect(screen.getByText("转账")).toBeInTheDocument();
  });

  it("转账金额不带正负号", () => {
    render(
      <TransactionListRow
        item={createItem({
          type: "transfer",
          amount: "5000",
          merchant_name: null,
          categoryItems: [],
          account_name: "日元现金 → 储蓄账户",
        })}
      />,
    );

    expect(screen.getByText("5,000 JPY")).toBeInTheDocument();
  });

  it("转账不需要商家/分类", () => {
    render(
      <TransactionListRow
        item={createItem({
          type: "transfer",
          merchant_name: null,
          categoryItems: [],
          account_name: "日元现金 → 储蓄账户",
        })}
      />,
    );

    expect(screen.queryByText("便利店")).toBeNull();
    expect(screen.getByText(/日元现金 → 储蓄账户/)).toBeInTheDocument();
  });
});
