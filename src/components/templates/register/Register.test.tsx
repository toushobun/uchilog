import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RegisterTemplate } from "./Register";

vi.mock("organisms/auth/RegisterForm", () => ({
  RegisterForm: ({
    requestOtpAction,
    submitOtpAction,
    turnstileSiteKey,
  }: {
    requestOtpAction: unknown;
    submitOtpAction: unknown;
    turnstileSiteKey: string;
  }): ReactNode => (
    <form
      data-testid="register-form"
      data-has-request-otp={String(Boolean(requestOtpAction))}
      data-has-submit-otp={String(Boolean(submitOtpAction))}
      data-turnstile-site-key={turnstileSiteKey}
    >
      <button type="submit">获取验证码</button>
    </form>
  ),
}));

afterEach(() => {
  cleanup();
});

const defaultProps = {
  requestOtpAction: vi.fn(async () => ({})),
  submitOtpAction: vi.fn(async () => ({})),
  turnstileSiteKey: "test-site-key",
};

describe("RegisterTemplate", () => {
  it("显示应用名称标题", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);

    expect(
      within(container).getByRole("heading", { name: "UchiLog" }),
    ).toBeTruthy();
  });

  it("显示注册提示文字", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);

    expect(
      within(container).getByText("创建账号后开始使用记账功能"),
    ).toBeTruthy();
  });

  it("渲染注册 OTP 表单", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);
    const form = within(container).getByTestId("register-form");

    expect(form).toBeTruthy();
    expect(form.getAttribute("data-has-request-otp")).toBe("true");
    expect(form.getAttribute("data-has-submit-otp")).toBe("true");
    expect(form.getAttribute("data-turnstile-site-key")).toBe("test-site-key");
  });

  it("显示返回登录页的链接", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);

    expect(
      within(container).getByRole("link", { name: "登录" }),
    ).toHaveAttribute("href", "/login");
  });
});
