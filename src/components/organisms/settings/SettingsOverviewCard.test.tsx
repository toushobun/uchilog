import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SettingsOverviewCard } from "./SettingsOverviewCard";

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

const baseProps = {
  currentLedgerName: "家庭账本",
  email: "test@example.com",
  logoutAction: vi.fn(async () => {}),
};

describe("SettingsOverviewCard", () => {
  it("显示应用名、账本名、邮箱和登出按钮", () => {
    const { container } = render(<SettingsOverviewCard {...baseProps} />);

    expect(
      within(container).getByRole("link", { name: "UchiLog" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByText("当前账本：家庭账本"),
    ).toBeInTheDocument();
    expect(within(container).getByText("test@example.com")).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "登出" }),
    ).toBeInTheDocument();
  });

  it("应用名和账本名链接到对应页面", () => {
    const { container } = render(<SettingsOverviewCard {...baseProps} />);

    expect(
      within(container)
        .getByRole("link", { name: "UchiLog" })
        .getAttribute("href"),
    ).toBe("/dashboard");
    expect(
      within(container)
        .getByRole("link", { name: "当前账本：家庭账本" })
        .getAttribute("href"),
    ).toBe("/ledgers");
  });
});
