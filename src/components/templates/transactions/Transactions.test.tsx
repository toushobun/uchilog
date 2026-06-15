import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTransactionMonthView } from "@/test/mocks/transactions";
import { transactionListPageErrorMessages } from "utils/transactionMessages";

import { TransactionsTemplate } from "./Transactions";

vi.mock("organisms/transactions/TransactionMonthList", () => ({
  TransactionMonthList: ({
    monthView,
  }: {
    monthView: { monthLabel: string };
  }): ReactNode => (
    <div data-testid="transaction-month-list">{monthView.monthLabel}</div>
  ),
}));

afterEach(() => {
  cleanup();
});

const monthView = createTransactionMonthView({
  month: "2026-06",
  monthLabel: "2026年6月",
  nextMonth: "2026-07",
  previousMonth: "2026-05",
  groups: [],
  summary: { balance: "0", currency: "JPY", expense: "0", income: "0" },
});

function renderPage(errorMessage: string | null = null) {
  return render(
    <TransactionsTemplate
      errorMessage={errorMessage}
      loadMoreAction={vi.fn(async () => ({ groups: [], nextOffset: null }))}
      monthView={monthView}
      voidAction={vi.fn()}
    />,
  );
}

describe("TransactionsTemplate", () => {
  it("显示明细标题", () => {
    const { container } = renderPage();

    expect(
      within(container).getByRole("heading", { name: "明细" }),
    ).toBeInTheDocument();
  });

  it("显示当前月份标签", () => {
    const { container } = renderPage();

    expect(within(container).getAllByText("2026年6月").length).toBeGreaterThan(
      0,
    );
  });

  it("上一个月导航链接指向正确月份", () => {
    const { container } = renderPage();

    const prevLink = within(container).getByRole("link", { name: "‹" });

    expect(prevLink.getAttribute("href")).toBe("/transactions?month=2026-05");
  });

  it("下一个月导航链接指向正确月份", () => {
    const { container } = renderPage();

    const nextLink = within(container).getByRole("link", { name: "›" });

    expect(nextLink.getAttribute("href")).toBe("/transactions?month=2026-07");
  });

  it("传入错误信息时显示错误提示", () => {
    const { container } = renderPage(
      transactionListPageErrorMessages.voidFailed,
    );

    expect(
      within(container).getByText(transactionListPageErrorMessages.voidFailed),
    ).toBeInTheDocument();
  });

  it("无错误信息时不显示错误提示", () => {
    const { container } = renderPage();

    expect(
      within(container).queryByText(
        transactionListPageErrorMessages.voidFailed,
      ),
    ).toBeNull();
  });
});
