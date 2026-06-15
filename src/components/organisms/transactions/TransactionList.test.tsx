import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  TransactionListItem,
  TransactionListPage,
} from "types/transactions";

import { createTransactionListItem } from "@/test/mocks/transactions";

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
const originalConfirm = window.confirm;

vi.mock("atoms/transactions/TransactionDateTime", () => ({
  TransactionDateTime: ({ value }: { value: string }) => <span>{value}</span>,
}));

beforeEach(() => {
  intersectionCallback = null;
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
  window.confirm = vi.fn(() => true);
});

afterEach(() => {
  cleanup();
  globalThis.IntersectionObserver = originalIntersectionObserver;
  window.confirm = originalConfirm;
});

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

    expect(screen.getByText("还没有记账记录。")).toBeInTheDocument();
  });

  it("显示初始记录内容", () => {
    render(
      <TransactionList
        initialPage={createPage([createTransactionListItem()], null)}
        loadMoreAction={vi.fn()}
      />,
    );

    expect(screen.getByText("支出")).toBeInTheDocument();
    expect(screen.getByText("饮食·餐饮")).toBeInTheDocument();
    expect(screen.getByText("便利店")).toBeInTheDocument();
    expect(screen.getByText("账户：日元现金")).toBeInTheDocument();
    expect(screen.getByText("-1,234 JPY")).toBeInTheDocument();
    expect(screen.getByText("测试备注")).toBeInTheDocument();
    expect(screen.getByText("已显示全部记录。")).toBeInTheDocument();
  });

  it("未传入撤销 action 时不显示撤销按钮", () => {
    render(
      <TransactionList
        initialPage={createPage([createTransactionListItem()], null)}
        loadMoreAction={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "撤销" })).toBeNull();
  });

  it("传入撤销 action 时显示撤销按钮并提交表单", () => {
    const voidAction = vi.fn();

    render(
      <TransactionList
        initialPage={createPage([createTransactionListItem()], null)}
        loadMoreAction={vi.fn()}
        voidAction={voidAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));

    expect(window.confirm).toHaveBeenCalledWith("确定要撤销这条记录吗？");
    expect(voidAction).toHaveBeenCalledTimes(1);
    expect(voidAction.mock.calls[0]?.[0].get("transactionRecordId")).toBe(
      "00000000-0000-4000-8000-000000009001",
    );
  });

  it("取消确认时不提交撤销表单", () => {
    const voidAction = vi.fn();
    window.confirm = vi.fn(() => false);

    render(
      <TransactionList
        initialPage={createPage([createTransactionListItem()], null)}
        loadMoreAction={vi.fn()}
        voidAction={voidAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));

    expect(window.confirm).toHaveBeenCalledWith("确定要撤销这条记录吗？");
    expect(voidAction).not.toHaveBeenCalled();
  });

  it("滚动到底部附近时读取下一页", async () => {
    const loadMoreAction = vi.fn(async () =>
      createPage(
        [
          createTransactionListItem({
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
        initialPage={createPage([createTransactionListItem()], 20)}
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
      expect(screen.getByText("第二页记录")).toBeInTheDocument();
      expect(screen.getByText("+5,678 JPY")).toBeInTheDocument();
    });
  });

  it("追加读取失败时显示错误和重新读取按钮", async () => {
    const loadMoreAction = vi.fn(async () => {
      throw new Error("failed");
    });

    render(
      <TransactionList
        initialPage={createPage([createTransactionListItem()], 20)}
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
      expect(
        screen.getByText("追加读取失败。请稍后重试。"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "重新读取" }),
      ).toBeInTheDocument();
    });
  });
});
