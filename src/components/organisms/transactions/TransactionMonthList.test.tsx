import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTransactionDateGroup,
  createTransactionListItem,
  createTransactionMonthView,
} from "@/test/mocks/transactions";

import { TransactionMonthList } from "./TransactionMonthList";

const originalConfirm = window.confirm;

beforeEach(() => {
  window.confirm = vi.fn(() => true);
});

afterEach(() => {
  cleanup();
  window.confirm = originalConfirm;
  vi.unstubAllGlobals();
});

describe("TransactionMonthList", () => {
  it("显示月度汇总和日期分组", () => {
    render(<TransactionMonthList monthView={createTransactionMonthView()} />);

    expect(screen.getByText("05/29 周五")).toBeInTheDocument();
    expect(screen.getAllByText("-1,234")[0]).toBeInTheDocument();
    expect(screen.getByText("支出 ¥1,234")).toBeInTheDocument();
  });

  it("显示交易行内容", () => {
    render(<TransactionMonthList monthView={createTransactionMonthView()} />);

    expect(screen.getByText("便利店")).toBeInTheDocument();
    expect(screen.getByText("饮食 > 餐饮")).toBeInTheDocument();
    expect(screen.getByText(/日元现金/)).toBeInTheDocument();
    expect(screen.getAllByText("-1,234")[0]).toBeInTheDocument();
  });

  it("没有记录时显示空状态", () => {
    render(
      <TransactionMonthList
        monthView={createTransactionMonthView({ groups: [] })}
      />,
    );

    expect(screen.getByText("这个月还没有记账记录。")).toBeInTheDocument();
  });

  it("传入删除 action 时显示删除按钮并提交表单", () => {
    const voidAction = vi.fn();

    render(
      <TransactionMonthList
        monthView={createTransactionMonthView()}
        voidAction={voidAction}
      />,
    );

    fireEvent.click(
      screen.getByText("便利店").closest("[data-testid]") ??
        screen.getByText("便利店"),
    );

    fireEvent.submit(
      screen.getByRole("button", { name: "删除" }).closest("form")!,
    );

    expect(window.confirm).toHaveBeenCalledWith("确定要删除这条记录吗？");
    expect(voidAction).toHaveBeenCalledTimes(1);
    expect(voidAction.mock.calls[0]?.[0].get("transactionRecordId")).toBe(
      "00000000-0000-4000-8000-000000009001",
    );
  });

  it("加载更多时合并同一天的日期分组", async () => {
    const loadMoreAction = vi.fn(async () => ({
      groups: [
        createTransactionDateGroup({
          items: [
            createTransactionListItem(),
            createTransactionListItem({
              amount: "2000",
              id: "00000000-0000-4000-8000-000000009002",
              merchant_name: "超市",
              note: null,
            }),
          ],
        }),
      ],
      nextOffset: null,
    }));

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private readonly callback: IntersectionObserverCallback) {}

        observe() {
          this.callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
          this.callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        }

        disconnect() {}
      },
    );

    render(
      <TransactionMonthList
        monthView={createTransactionMonthView({ nextOffset: 20 })}
        loadMoreAction={loadMoreAction}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("超市")).toBeInTheDocument();
    });

    expect(loadMoreAction).toHaveBeenCalledWith(20);
    expect(loadMoreAction).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("05/29 周五")).toHaveLength(1);
    expect(screen.getAllByText("便利店")).toHaveLength(1);
    expect(screen.getByText("支出 ¥3,234")).toBeInTheDocument();
  });
});
