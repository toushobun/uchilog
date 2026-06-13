import { cleanup, render, within } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MonthNavButton } from "./MonthNavButton";

type MockNextLinkProps = {
  children: ReactNode;
  href: string;
  [key: string]: unknown;
};

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: MockNextLinkProps) => {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <a href={href} {...anchorProps}>
        {children}
      </a>
    );
  },
}));

afterEach(() => {
  cleanup();
});

describe("MonthNavButton", () => {
  it("显示按钮内容", () => {
    const { container } = render(
      <MonthNavButton href="/statistics?month=2026-05">
        ‹ 上个月
      </MonthNavButton>,
    );

    expect(within(container).queryByText("‹ 上个月")).not.toBeNull();
  });

  it("链接指向正确的 href", () => {
    const { container } = render(
      <MonthNavButton href="/statistics?month=2026-07">
        下个月 ›
      </MonthNavButton>,
    );

    expect(within(container).getByRole("link").getAttribute("href")).toBe(
      "/statistics?month=2026-07",
    );
  });
});
