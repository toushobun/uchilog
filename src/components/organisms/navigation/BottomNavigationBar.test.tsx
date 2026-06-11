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

  it("新增记录子路径也不选中明细导航", () => {
    mockedPathname = "/transactions/new/template";
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
