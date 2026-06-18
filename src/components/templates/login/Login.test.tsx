import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginTemplate } from "./Login";

vi.mock("organisms/auth/LoginForm", () => ({
  LoginForm: ({ initialEmail }: { initialEmail?: string }): ReactNode => (
    <form data-testid="login-form" data-initial-email={initialEmail ?? ""}>
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

  it("向登录表单传递预填邮箱", () => {
    const { container } = render(
      <LoginTemplate
        action={vi.fn(async () => ({}))}
        initialEmail="yamada@example.test"
      />,
    );

    expect(
      within(container)
        .getByTestId("login-form")
        .getAttribute("data-initial-email"),
    ).toBe("yamada@example.test");
  });

  it("显示前往注册页的链接", () => {
    const { container } = render(
      <LoginTemplate action={vi.fn(async () => ({}))} />,
    );

    expect(
      within(container).getByRole("link", { name: "注册" }),
    ).toHaveAttribute("href", "/register");
  });
});
