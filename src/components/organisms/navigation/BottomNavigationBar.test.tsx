import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BottomNavigationBar } from "./BottomNavigationBar";

let mockedPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

function renderBottomNavigationBar() {
  return render(<BottomNavigationBar />);
}

function getBottomNavigationIcons(container: HTMLElement) {
  const nav = within(container).getByRole("navigation");
  return Array.from(nav.querySelectorAll("img"));
}

describe("BottomNavigationBar", () => {
  beforeEach(() => {
    mockedPathname = "/dashboard";
  });

  it("按配置的左右分组在新增按钮两侧渲染导航", () => {
    const { container } = renderBottomNavigationBar();
    const nav = within(container).getByRole("navigation");
    const links = within(nav).getAllByRole("link");

    expect(
      links.map((link) => link.getAttribute("aria-label") ?? link.textContent),
    ).toEqual(["首页", "明细", "新增记录", "统计", "设置"]);
  });

  it("底部导航渲染对应的自定义图标", () => {
    const { container } = renderBottomNavigationBar();

    expect(
      getBottomNavigationIcons(container).map((icon) =>
        icon.getAttribute("src"),
      ),
    ).toEqual([
      "/assets/kura-icons/home.png",
      "/assets/kura-icons/transactions.png",
      "/assets/kura-icons/quick-record.png",
      "/assets/kura-icons/statistics.png",
      "/assets/kura-icons/settings.png",
    ]);
  });

  it("底部导航图标作为装饰图标隐藏无障碍信息", () => {
    const { container } = renderBottomNavigationBar();

    for (const icon of getBottomNavigationIcons(container)) {
      expect(icon).toHaveAttribute("alt", "");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("当前路径匹配时选中对应导航", () => {
    mockedPathname = "/transactions/monthly";
    const { container } = renderBottomNavigationBar();

    expect(
      within(container)
        .getByRole("link", { name: "明细" })
        .getAttribute("aria-current"),
    ).toBe("page");
  });

  it("新增记录页不选中明细导航", () => {
    mockedPathname = "/transactions/new";
    const { container } = renderBottomNavigationBar();

    expect(
      within(container)
        .getByRole("link", { name: "明细" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("编辑记录页不选中明细导航", () => {
    mockedPathname = "/transactions/00000000-0000-4000-8000-000000009999/edit";
    const { container } = renderBottomNavigationBar();

    expect(
      within(container)
        .getByRole("link", { name: "明细" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("新增记录按钮链接到新增记账页面", () => {
    const { container } = renderBottomNavigationBar();

    expect(
      within(container).getByLabelText("新增记录").getAttribute("href"),
    ).toBe("/transactions/new");
  });
});
