import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardAmountSummary } from "@/test/mocks/dashboard";

import { DashboardMonthSummaryCard } from "./DashboardMonthSummaryCard";

describe("DashboardMonthSummaryCard", () => {
  it("显示月度收支汇总", () => {
    render(
      <DashboardMonthSummaryCard
        monthLabel="2026年5月"
        monthSummary={createDashboardAmountSummary()}
      />,
    );

    expect(screen.getByText("2026年5月")).toBeTruthy();
    expect(screen.getByText("结余")).toBeTruthy();
    expect(screen.getByText("180,000")).toBeTruthy();
    expect(screen.getByText("260,000")).toBeTruthy();
    expect(screen.getByText("80,000")).toBeTruthy();
  });
});
