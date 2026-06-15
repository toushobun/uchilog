import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProtectedLayoutShell } from "./ProtectedLayoutShell";

vi.mock("templates/protected/AppShell", () => ({
  AppShell: ({
    children,
    email,
  }: {
    children: ReactNode;
    email: string;
  }): ReactNode => (
    <div data-testid="app-shell" data-email={email}>
      {children}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("ProtectedLayoutShell", () => {
  it("将用户邮箱继续传给 AppShell", () => {
    render(
      <ProtectedLayoutShell email="test@example.com">
        <div>受保护内容</div>
      </ProtectedLayoutShell>,
    );

    expect(screen.getByTestId("app-shell").getAttribute("data-email")).toBe(
      "test@example.com",
    );
    expect(screen.getByText("受保护内容")).toBeInTheDocument();
  });
});
