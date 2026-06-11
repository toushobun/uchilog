import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginTemplate } from "./Login";

vi.mock("organisms/auth/LoginForm", () => ({
  LoginForm: ({ action }: { action: unknown }): ReactNode => (
    <form
      data-testid="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        void (action as () => Promise<void>)();
      }}
    >
      <button type="submit">登录</button>
    </form>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("LoginTemplate", () => {
  it("显示应用名称标题", () => {
    const { container } = render(
      <LoginTemplate action={vi.fn(async () => ({}))} />,
    );

    expect(
      within(container).getByRole("heading", { name: "UchiLog" }),
    ).toBeTruthy();
  });

  it("显示登录提示文字", () => {
    const { container } = render(
      <LoginTemplate action={vi.fn(async () => ({}))} />,
    );

    expect(within(container).getByText("登录后开始使用记账功能")).toBeTruthy();
  });

  it("渲染登录表单", () => {
    const { container } = render(
      <LoginTemplate action={vi.fn(async () => ({}))} />,
    );

    expect(within(container).getByTestId("login-form")).toBeTruthy();
  });
});
