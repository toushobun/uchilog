// @vitest-environment jsdom

import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

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

vi.mock("./actions", () => ({
  logout: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

function renderAppShell() {
  return render(
    <AppShell email="test@example.com">
      <div>内容</div>
    </AppShell>,
  );
}

describe("AppShell", () => {
  beforeEach(() => {
    mockedPathname = "/dashboard";
  });

  it("/transactions 时明细导航为选中状态", () => {
    mockedPathname = "/transactions";
    const { container } = renderAppShell();

    expect(
      within(container)
        .getByRole("link", { name: "明细" })
        .getAttribute("aria-current"),
    ).toBe("page");
  });

  it("/transactions/new 时明细导航不是选中状态", () => {
    mockedPathname = "/transactions/new";
    const { container } = renderAppShell();

    expect(
      within(container)
        .getByRole("link", { name: "明细" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("新增记录按钮链接到新增记账页面", () => {
    const { container } = renderAppShell();

    expect(
      within(container).getByLabelText("新增记录").getAttribute("href"),
    ).toBe("/transactions/new");
  });
});
