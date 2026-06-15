import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardViewData } from "@/test/mocks/dashboard";

import { DashboardTemplate } from "./Dashboard";

describe("DashboardTemplate", () => {
  it("显示首页摘要", () => {
    render(<DashboardTemplate data={createDashboardViewData()} />);

    expect(screen.getByText("2026年6月")).toBeInTheDocument();
    expect(screen.getByText("结余")).toBeInTheDocument();
    expect(screen.getByText("最近记录")).toBeInTheDocument();
    expect(screen.getByText("本月还没有记账记录。")).toBeInTheDocument();
    expect(screen.getByText("今日支出")).toBeInTheDocument();
    expect(screen.getByText("本周支出")).toBeInTheDocument();
  });
});
