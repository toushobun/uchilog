// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardHome } from "./DashboardHome";

const data = {
  ledgerName: "家庭账本",
  monthLabel: "2026年6月",
  monthSummary: {
    balance: "180000",
    currency: "JPY",
    expense: "80000",
    income: "260000",
  },
  recentTransactions: [],
  todayExpense: { expense: "331", currency: "JPY", recordCount: 2 },
  weekExpense: { expense: "2840", currency: "JPY", recordCount: 8 },
};

describe("DashboardHome", () => {
  it("显示首页摘要", () => {
    render(<DashboardHome data={data} />);

    expect(screen.getByText("2026年6月")).toBeTruthy();
    expect(screen.getByText("结余")).toBeTruthy();
    expect(screen.getByText("最近记录")).toBeTruthy();
    expect(screen.getByText("本月还没有记账记录。")).toBeTruthy();
  });
});
