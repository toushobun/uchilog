import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BottomNavButton } from "./BottomNavButton";

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

describe("BottomNavButton", () => {
  it("显示按钮文字", () => {
    const { container } = render(
      <BottomNavButton href="/dashboard" label="仪表盘" selected={false} />,
    );

    expect(within(container).getByText("仪表盘")).toBeTruthy();
  });

  it("链接指向正确的 href", () => {
    const { container } = render(
      <BottomNavButton href="/dashboard" label="仪表盘" selected={false} />,
    );

    expect(within(container).getByRole("link").getAttribute("href")).toBe(
      "/dashboard",
    );
  });

  it("选中状态时 aria-current 为 page", () => {
    const { container } = render(
      <BottomNavButton href="/dashboard" label="仪表盘" selected={true} />,
    );

    expect(
      within(container).getByRole("link").getAttribute("aria-current"),
    ).toBe("page");
  });

  it("未选中时不设置 aria-current", () => {
    const { container } = render(
      <BottomNavButton href="/dashboard" label="仪表盘" selected={false} />,
    );

    expect(
      within(container).getByRole("link").getAttribute("aria-current"),
    ).toBeNull();
  });
});
