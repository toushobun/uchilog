import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  TransactionListItem,
  TransactionMonthView,
} from "types/transactions";

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

function createItem(
  overrides: Partial<TransactionListItem> = {},
): TransactionListItem {
  return {
    account_currency: "JPY",
    account_name: "日元现金",
    amount: "1234",
    categoryItems: [
      { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
    ],
    created_at: "2026-05-29T03:20:10.000Z",
    id: "00000000-0000-4000-8000-000000009001",
    merchant_icon_url: null,
    merchant_name: "便利店",
    note: "测试备注",
    transaction_at: "2026-05-29T03:20:10.000Z",
    type: "expense",
    recorder_name: null,
    ...overrides,
  };
}

function createMonthView(
  overrides: Partial<TransactionMonthView> = {},
): TransactionMonthView {
  return {
    groups: [
      {
        date: "2026-05-29",
        items: [createItem()],
        label: "05/29 周五",
        summary: {
          balance: "-1234",
          currency: "JPY",
          expense: "1234",
          income: "0",
        },
      },
    ],
    month: "2026-05",
    monthLabel: "2026年5月",
    nextMonth: "2026-06",
    previousMonth: "2026-04",
    summary: {
      balance: "98766",
      currency: "JPY",
      expense: "1234",
      income: "100000",
    },
    nextOffset: null,
    ...overrides,
  };
}

describe("TransactionMonthList", () => {
  it("显示月度汇总和日期分组", () => {
    render(<TransactionMonthList monthView={createMonthView()} />);

    expect(screen.getByText("收入")).toBeTruthy();
    expect(screen.getByText("100,000")).toBeTruthy();
    expect(screen.getByText("支出")).toBeTruthy();
    expect(screen.getByText("1,234")).toBeTruthy();
    expect(screen.getByText("结余")).toBeTruthy();
    expect(screen.getByText("98,766")).toBeTruthy();
    expect(screen.getByText("05/29 周五")).toBeTruthy();
    expect(screen.getAllByText("-1,234")[0]).toBeTruthy();
  });

  it("显示交易行内容", () => {
    render(<TransactionMonthList monthView={createMonthView()} />);

    expect(screen.getByText("便利店")).toBeTruthy();
    expect(screen.getByText("饮食·餐饮 · 测试备注")).toBeTruthy();
    expect(screen.getByText(/日元现金/)).toBeTruthy();
    expect(screen.getAllByText("-1,234")[0]).toBeTruthy();
  });

  it("没有记录时显示空状态", () => {
    render(
      <TransactionMonthList
        monthView={createMonthView({
          groups: [],
          summary: {
            balance: "0",
            currency: "JPY",
            expense: "0",
            income: "0",
          },
        })}
      />,
    );

    expect(screen.getByText("这个月还没有记账记录。")).toBeTruthy();
  });

  it("传入撤销 action 时显示撤销按钮并提交表单", () => {
    const voidAction = vi.fn();

    render(
      <TransactionMonthList
        monthView={createMonthView()}
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

  it("加载更多时合并同一天的日期分组", async () => {
    const loadMoreAction = vi.fn(async () => ({
      groups: [
        {
          date: "2026-05-29",
          items: [
            createItem(),
            createItem({
              amount: "2000",
              id: "00000000-0000-4000-8000-000000009002",
              merchant_name: "超市",
              note: null,
            }),
          ],
          label: "05/29 周五",
          summary: {
            balance: "-3234",
            currency: "JPY",
            expense: "3234",
            income: "0",
          },
        },
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
        monthView={createMonthView({ nextOffset: 20 })}
        loadMoreAction={loadMoreAction}
      />,
    );

    await waitFor(() => expect(screen.getByText("超市")).toBeTruthy());

    expect(loadMoreAction).toHaveBeenCalledWith(20);
    expect(loadMoreAction).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("05/29 周五")).toHaveLength(1);
    expect(screen.getAllByText("便利店")).toHaveLength(1);
    expect(screen.getByText("-3,234")).toBeTruthy();
  });
});
