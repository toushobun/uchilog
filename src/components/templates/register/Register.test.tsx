import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { turnstileTestSiteKey } from "config/turnstile";

import { RegisterTemplate } from "./Register";

vi.mock("organisms/auth/RegisterForm", () => ({
  RegisterForm: ({
    checkEmailAvailabilityAction,
    requestOtpAction,
    submitOtpAction,
    turnstileSiteKey,
  }: {
    checkEmailAvailabilityAction: unknown;
    requestOtpAction: unknown;
    submitOtpAction: unknown;
    turnstileSiteKey: string;
  }): ReactNode => (
    <form
      data-testid="register-form"
      data-has-email-check-action={String(
        Boolean(checkEmailAvailabilityAction),
      )}
      data-has-request-action={String(Boolean(requestOtpAction))}
      data-has-submit-action={String(Boolean(submitOtpAction))}
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
  checkEmailAvailabilityAction: vi.fn(async () => ({ available: true })),
  requestOtpAction: vi.fn(async () => ({})),
  submitOtpAction: vi.fn(async () => ({})),
  turnstileSiteKey: turnstileTestSiteKey,
};

describe("RegisterTemplate", () => {
  it("显示应用名称标题", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);

    expect(
      within(container).getByRole("heading", { name: "KuraNote" }),
    ).toBeTruthy();
  });

  it("渲染注册表单", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);
    const form = within(container).getByTestId("register-form");

    expect(form.getAttribute("data-has-email-check-action")).toBe("true");
    expect(form.getAttribute("data-has-request-action")).toBe("true");
    expect(form.getAttribute("data-has-submit-action")).toBe("true");
    expect(form.getAttribute("data-turnstile-site-key")).toBe(
      turnstileTestSiteKey,
    );
  });

  it("显示返回登录页的链接", () => {
    const { container } = render(<RegisterTemplate {...defaultProps} />);

    expect(
      within(container).getByRole("link", { name: "登录" }),
    ).toHaveAttribute("href", "/login");
  });
});
