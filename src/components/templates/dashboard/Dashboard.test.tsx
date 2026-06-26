import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDashboardViewData } from "@/test/mocks/dashboard";

import { DashboardTemplate } from "./Dashboard";

describe("DashboardTemplate", () => {
  it("显示首页手账模块", () => {
    render(<DashboardTemplate data={createDashboardViewData()} />);

    expect(screen.getByText("早呀，今天也好好记录 🌼")).toBeInTheDocument();
    expect(screen.getByText("本月收入")).toBeInTheDocument();
    expect(screen.getByText("本月支出")).toBeInTheDocument();
    expect(screen.getByText("账户余额")).toBeInTheDocument();
    expect(screen.getByText("现金钱包")).toBeInTheDocument();
    expect(screen.getByText("快速记账")).toBeInTheDocument();
    expect(screen.getByText("拍照记账")).toBeInTheDocument();
    expect(screen.getAllByText("敬请期待")).toHaveLength(2);
    expect(screen.getByText("近期记录")).toBeInTheDocument();
    expect(screen.getByText("本月还没有记账记录。")).toBeInTheDocument();
  });

  it("首页快速记账入口使用装饰性自定义图标", () => {
    const { container } = render(
      <DashboardTemplate data={createDashboardViewData()} />,
    );

    const quickRecordIcon = container.querySelector(
      'img[src="/assets/kura-icons/quick-record.png"]',
    );

    expect(quickRecordIcon).toBeInTheDocument();
    expect(quickRecordIcon).toHaveAttribute("alt", "");
    expect(quickRecordIcon).toHaveAttribute("aria-hidden", "true");
  });

  it("按照指定顺序展示首页模块", () => {
    const { container } = render(
      <DashboardTemplate data={createDashboardViewData()} />,
    );

    const content = container.textContent ?? "";
    const labels = [
      "早呀，今天也好好记录 🌼",
      "本月收入",
      "账户余额",
      "快速记账",
      "近期记录",
    ];
    const positions = labels.map((label) => content.indexOf(label));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
