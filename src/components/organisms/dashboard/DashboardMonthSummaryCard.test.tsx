import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardAccountSummary } from "@/test/mocks/dashboard";

import { DashboardMonthSummaryCard } from "./DashboardMonthSummaryCard";

describe("DashboardMonthSummaryCard", () => {
  it("显示账户余额汇总", () => {
    render(
      <DashboardMonthSummaryCard
        accounts={[createDashboardAccountSummary()]}
        monthLabel="2026年5月"
      />,
    );

    expect(screen.getByText("2026年5月")).toBeTruthy();
    expect(screen.getByText("账户余额")).toBeTruthy();
    expect(screen.getByText("现金钱包")).toBeTruthy();
    expect(screen.getByText("¥2,580")).toBeTruthy();
  });
});
