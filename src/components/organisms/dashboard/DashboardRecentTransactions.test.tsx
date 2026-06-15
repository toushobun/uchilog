import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardRecentTransaction } from "@/test/mocks/dashboard";

import { DashboardRecentTransactions } from "./DashboardRecentTransactions";

describe("DashboardRecentTransactions", () => {
  it("没有记录时显示空状态", () => {
    render(<DashboardRecentTransactions transactions={[]} />);

    expect(screen.getByText("最近记录")).toBeInTheDocument();
    expect(screen.getByText("本月还没有记账记录。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "全部 →" })).toBeInTheDocument();
  });

  it("有记录时显示交易行", () => {
    render(
      <DashboardRecentTransactions
        transactions={[createDashboardRecentTransaction()]}
      />,
    );

    expect(screen.getByText("便利店")).toBeInTheDocument();
    expect(screen.getByText("饮食·餐饮 · 测试备注")).toBeInTheDocument();
  });
});
