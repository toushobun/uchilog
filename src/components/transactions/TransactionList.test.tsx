// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionListItem, TransactionListPage } from "transactions-route/types";

import { TransactionList } from "./TransactionList";

let intersectionCallback:
  | ((entries: IntersectionObserverEntry[]) => void)
  | null = null;

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    intersectionCallback = callback;
  }
}

const originalIntersectionObserver = globalThis.IntersectionObserver;

vi.mock("transactions/TransactionDateTime", () => ({
  TransactionDateTime: ({ value }: { value: string }) => <span>{value}</span>,
}));

beforeEach(() => {
  intersectionCallback = null;
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
  globalThis.IntersectionObserver = originalIntersectionObserver;
});

function createItem(overrides: Partial<TransactionListItem> = {}): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: "日元现金",
    amount: "1234",
    category_name: "餐饮",
    created_at: "2026-06-05T03:20:10.000Z",
    id: "00000000-0000-4000-8000-000000009001",
    merchant_icon_url: null,
    merchant_name: "便利店",
    note: "测试备注",
    transaction_at: "2026-06-05T03:20:10.000Z",
    type: "expense",
    ...overrides,
  };
}

function createPage(
  items: TransactionListItem[],
  nextOffset: number | null,
): TransactionListPage {
  return {
    items,
    nextOffset,
  };
}

describe("TransactionList", () => {
  it("没有记录时显示空状态", () => {
    render(
      <TransactionList
        initialPage={createPage([], null)}
        loadMoreAction={vi.fn()}
      />,
    );

    expect(screen.getByText("还没有记账记录。")).toBeTruthy();
  });

  it("显示初始记录内容", () => {
    render(
      <TransactionList
        initialPage={createPage([createItem()], null)}
        loadMoreAction={vi.fn()}
      />,
    );

    expect(screen.getByText("支出")).toBeTruthy();
    expect(screen.getByText("餐饮")).toBeTruthy();
    expect(screen.getByText("便利店")).toBeTruthy();
    expect(screen.getByText("账户：日元现金")).toBeTruthy();
    expect(screen.getByText("-1,234 JPY")).toBeTruthy();
    expect(screen.getByText("测试备注")).toBeTruthy();
    expect(screen.getByText("已显示全部记录。")).toBeTruthy();
  });

  it("滚动到底部附近时读取下一页", async () => {
    const loadMoreAction = vi.fn(async () =>
      createPage(
        [
          createItem({
            amount: "5678",
            id: "00000000-0000-4000-8000-000000009002",
            note: "第二页记录",
            type: "income",
          }),
        ],
        null,
      ),
    );

    render(
      <TransactionList
        initialPage={createPage([createItem()], 20)}
        loadMoreAction={loadMoreAction}
      />,
    );

    await act(async () => {
      intersectionCallback?.([
        {
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ]);
    });

    await waitFor(() => {
      expect(loadMoreAction).toHaveBeenCalledWith(20);
      expect(screen.getByText("第二页记录")).toBeTruthy();
      expect(screen.getByText("+5,678 JPY")).toBeTruthy();
    });
  });

  it("追加读取失败时显示错误和重新读取按钮", async () => {
    const loadMoreAction = vi.fn(async () => {
      throw new Error("failed");
    });

    render(
      <TransactionList
        initialPage={createPage([createItem()], 20)}
        loadMoreAction={loadMoreAction}
      />,
    );

    await act(async () => {
      intersectionCallback?.([
        {
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ]);
    });

    await waitFor(() => {
      expect(screen.getByText("追加读取失败。请稍后重试。")).toBeTruthy();
      expect(screen.getByRole("button", { name: "重新读取" })).toBeTruthy();
    });
  });
});
