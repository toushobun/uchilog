import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardPeriodExpense } from "@/test/mocks/dashboard";

import { DashboardPeriodExpenses } from "./DashboardPeriodExpenses";

describe("DashboardPeriodExpenses", () => {
  it("显示今日和本周支出卡片", () => {
    render(
      <DashboardPeriodExpenses
        todayExpense={createDashboardPeriodExpense({
          expense: "1000",
          recordCount: 3,
        })}
        weekExpense={createDashboardPeriodExpense({
          expense: "5000",
          recordCount: 12,
        })}
      />,
    );

    expect(screen.getByText("今日支出")).toBeTruthy();
    expect(screen.getByText("本周支出")).toBeTruthy();
    expect(screen.getByText("-1,000")).toBeTruthy();
    expect(screen.getByText("-5,000")).toBeTruthy();
  });
});
