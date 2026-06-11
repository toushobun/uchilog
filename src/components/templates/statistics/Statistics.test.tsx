import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { StatisticsViewData } from "types/statistics";

import { StatisticsTemplate } from "./Statistics";

const statisticsView: StatisticsViewData = {
  categoryExpenseRanking: [
    {
      amount: "2500",
      id: "category-food",
      name: "食费 / 外食",
      transactionCount: 2,
    },
  ],
  ledgerName: "家庭账本",
  merchantExpenseRanking: [
    {
      amount: "1500",
      id: "merchant-super",
      name: "超市",
      transactionCount: 1,
    },
  ],
  month: "2026-06",
  monthLabel: "2026年6月",
  nextMonth: "2026-07",
  previousMonth: "2026-05",
  summary: {
    balance: "246700",
    currency: "JPY",
    expense: "3300",
    income: "250000",
  },
};

const emptyStatisticsView: StatisticsViewData = {
  ...statisticsView,
  categoryExpenseRanking: [],
  merchantExpenseRanking: [],
  summary: {
    balance: "0",
    currency: "JPY",
    expense: "0",
    income: "0",
  },
};

afterEach(() => {
  cleanup();
});

describe("StatisticsTemplate", () => {
  it("显示统计页面标题、账本和月份", () => {
    const { container } = render(<StatisticsTemplate {...statisticsView} />);

    expect(
      within(container).getByRole("heading", { name: "统计" }),
    ).toBeTruthy();
    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
    expect(within(container).getByText("2026年6月")).toBeTruthy();
  });

  it("显示月度收支汇总", () => {
    const { container } = render(<StatisticsTemplate {...statisticsView} />);

    expect(within(container).getByText("本月收入")).toBeTruthy();
    expect(within(container).getByText("250,000 JPY")).toBeTruthy();
    expect(within(container).getByText("本月支出")).toBeTruthy();
    expect(within(container).getByText("3,300 JPY")).toBeTruthy();
    expect(within(container).getByText("本月净收支")).toBeTruthy();
    expect(within(container).getByText("246,700 JPY")).toBeTruthy();
  });

  it("先显示分类支出汇总，再显示商家支出排行", () => {
    const { container } = render(<StatisticsTemplate {...statisticsView} />);
    const headings = within(container).getAllByRole("heading", { level: 2 });

    expect(headings.map((heading) => heading.textContent)).toEqual([
      "分类支出汇总",
      "商家支出排行",
    ]);
  });

  it("显示分类和商家支出排行", () => {
    const { container } = render(<StatisticsTemplate {...statisticsView} />);

    expect(
      within(container).getByRole("heading", { name: "分类支出汇总" }),
    ).toBeTruthy();
    expect(within(container).getByText("食费 / 外食")).toBeTruthy();
    expect(within(container).getByText("2 笔 · 占比 76%")).toBeTruthy();
    expect(
      within(container).getByRole("heading", { name: "商家支出排行" }),
    ).toBeTruthy();
    expect(within(container).getByText("超市")).toBeTruthy();
    expect(within(container).getByText("1 笔 · 占比 45%")).toBeTruthy();
    expect(
      within(container).getByRole("progressbar", { name: "超市支出占比" }),
    ).toBeTruthy();
  });

  it("显示月份切换链接", () => {
    const { container } = render(<StatisticsTemplate {...statisticsView} />);

    expect(
      within(container)
        .getByRole("link", { name: "‹ 上个月" })
        .getAttribute("href"),
    ).toBe("/statistics?month=2026-05");
    expect(
      within(container)
        .getByRole("link", { name: "下个月 ›" })
        .getAttribute("href"),
    ).toBe("/statistics?month=2026-07");
  });

  it("没有排行数据时显示空状态", () => {
    const { container } = render(
      <StatisticsTemplate {...emptyStatisticsView} />,
    );

    expect(within(container).getByText("暂无统计数据")).toBeTruthy();
    expect(
      within(container).getByText("这个月还没有可以统计的收入或支出。"),
    ).toBeTruthy();
  });
});
