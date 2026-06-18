import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { turnstileTestSiteKey } from "config/turnstile";

import { installMockTurnstile } from "./mockTurnstile";
import { RegisterForm } from "./RegisterForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

beforeEach(() => {
  installMockTurnstile();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createDefaultProps() {
  return {
    requestOtpAction: vi.fn(async () => ({})),
    submitOtpAction: vi.fn(async () => ({})),
    turnstileSiteKey: turnstileTestSiteKey,
  };
}

async function fillRegisterFields() {
  fireEvent.change(screen.getByLabelText(/邮箱/), {
    target: { value: "yamada@example.test" },
  });
  fireEvent.change(screen.getByLabelText(/昵称/), {
    target: { value: "山田太郎" },
  });
  fireEvent.change(screen.getByLabelText(/^密码/), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByLabelText(/确认密码/), {
    target: { value: "password123" },
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "获取验证码" })).toBeEnabled();
  });
}

describe("RegisterForm", () => {
  it("显示注册所需输入框", () => {
    render(<RegisterForm {...createDefaultProps()} />);

    expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
    expect(screen.getByLabelText(/昵称/)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/密码/)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/)).toBeInTheDocument();
  });

  it("实时显示字段校验错误", () => {
    render(<RegisterForm {...createDefaultProps()} />);

    fireEvent.change(screen.getByLabelText(/邮箱/), {
      target: { value: "not-email" },
    });
    fireEvent.change(screen.getByLabelText(/^密码/), {
      target: { value: "password" },
    });

    expect(screen.getByText("邮箱格式有误")).toBeInTheDocument();
    expect(
      screen.queryByText("密码至少 8 位，并且需要同时包含字母和数字。"),
    ).not.toBeInTheDocument();

    fireEvent.blur(screen.getByLabelText(/^密码/));

    expect(
      screen.getByText("密码至少 8 位，并且需要同时包含字母和数字。"),
    ).toBeInTheDocument();
  });

  it("Turnstile 失败时显示重试入口", async () => {
    window.turnstile = {
      render: (_container, options) => {
        options["error-callback"]();
        return "mock-turnstile-error";
      },
      remove: vi.fn(),
      reset: vi.fn(),
    };
    render(<RegisterForm {...createDefaultProps()} />);

    fireEvent.change(screen.getByLabelText(/邮箱/), {
      target: { value: "yamada@example.test" },
    });
    fireEvent.change(screen.getByLabelText(/昵称/), {
      target: { value: "山田太郎" },
    });
    fireEvent.change(screen.getByLabelText(/^密码/), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/确认密码/), {
      target: { value: "password123" },
    });

    expect(
      await screen.findByText("人机验证失败，请刷新页面后再试。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "重新加载验证" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "获取验证码" })).toBeDisabled();
  });

  it("初始阶段进入限流冷却后隐藏 Turnstile", async () => {
    const mockTurnstile = installMockTurnstile();
    const removeSpy = vi.spyOn(mockTurnstile, "remove");
    const props = createDefaultProps();
    props.requestOtpAction.mockResolvedValue({
      error: "验证码发送过于频繁，请稍后再试",
      retryAfterSeconds: 42,
      status: "rate_limited",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    expect(
      await screen.findByText(
        "验证码发送过于频繁，请稍后再试 42 秒后可重新获取验证码。",
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalled();
    });
    expect(
      document.querySelector("[data-turnstile-widget-id]"),
    ).not.toBeInTheDocument();
  });

  it("获取验证码成功后进入 OTP 输入阶段", async () => {
    const props = createDefaultProps();
    props.requestOtpAction.mockResolvedValue({
      status: "success",
      success: "验证码已发送。",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    expect(await screen.findByLabelText(/验证码/)).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱")).toHaveAttribute("readonly");
    const modifyButton = screen.getByRole("button", { name: "修改注册信息" });
    await waitFor(() => {
      expect(modifyButton).toBeEnabled();
    });
    fireEvent.click(modifyButton);
    await waitFor(() => {
      expect(screen.getByLabelText(/^密码/)).toHaveValue("");
      expect(screen.getByLabelText(/确认密码/)).toHaveValue("");
    });
  });

  it("提交验证码时调用提交 action 并显示剩余次数", async () => {
    const props = createDefaultProps();
    props.requestOtpAction.mockResolvedValue({ status: "success" });
    props.submitOtpAction.mockResolvedValue({
      error: "验证码不正确或已过期，请重新获取",
      remainingAttempts: 4,
      status: "otp_invalid",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.change(await screen.findByLabelText(/验证码/), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    expect(await screen.findByText("剩余可尝试次数：4")).toBeInTheDocument();
    expect(props.submitOtpAction).toHaveBeenCalled();
    const submittedFormData = (
      props.submitOtpAction.mock.calls as unknown as Array<[unknown, FormData]>
    )[0]?.[1];
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect(submittedFormData?.has("displayName")).toBe(false);
  });

  it("可以修改注册信息并回到初始填写阶段", async () => {
    const props = createDefaultProps();
    props.requestOtpAction.mockResolvedValue({ status: "success" });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    const modifyButton = await screen.findByRole("button", {
      name: "修改注册信息",
    });
    await waitFor(() => {
      expect(modifyButton).toBeEnabled();
    });
    fireEvent.click(modifyButton);

    expect(
      screen.getByText("注册信息已修改，请重新获取验证码"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "获取验证码" }),
    ).toBeInTheDocument();
  });

  it("冷却结束后可以使用锁定信息重新发送验证码", async () => {
    const props = createDefaultProps();
    props.requestOtpAction
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" })
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "重新发送验证码" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    await waitFor(() => {
      expect(props.requestOtpAction).toHaveBeenCalledTimes(2);
    });
    const resendFormData = (
      props.requestOtpAction.mock.calls as unknown as Array<[unknown, FormData]>
    )[1]?.[1];
    expect(resendFormData?.get("email")).toBe("yamada@example.test");
    expect(resendFormData?.get("resend")).toBe("true");
    expect(resendFormData?.has("displayName")).toBe(false);
    expect(resendFormData?.has("password")).toBe(false);
    expect(resendFormData?.has("passwordConfirm")).toBe(false);
  });

  it("重新发送要求重置密码时回到初始阶段", async () => {
    const props = createDefaultProps();
    props.requestOtpAction
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" })
      .mockResolvedValueOnce({
        error: "密码强度不足",
        resetPassword: true,
        status: "validation_error",
      });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "重新发送验证码" }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    expect(await screen.findByText("密码强度不足")).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码/)).toHaveValue("");
    fireEvent.change(screen.getByLabelText(/^密码/), {
      target: { value: "new-password123" },
    });
    fireEvent.change(screen.getByLabelText(/确认密码/), {
      target: { value: "new-password123" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "获取验证码" })).toBeEnabled();
    });
  });

  it("注册字段包含适合密码管理器的自动填充属性", () => {
    render(<RegisterForm {...createDefaultProps()} />);

    expect(screen.getByLabelText(/邮箱/)).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText(/^密码/)).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByLabelText(/确认密码/)).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });

  it("重新发送期间禁用重新发送按钮", async () => {
    const props = createDefaultProps();
    let resolveResend: (value: {
      retryAfterSeconds: number;
      status: "success";
    }) => void = () => undefined;
    props.requestOtpAction
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveResend = resolve;
        }),
      );
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "重新发送验证码" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    expect(
      await screen.findByRole("button", { name: "发送中..." }),
    ).toBeDisabled();

    resolveResend({ retryAfterSeconds: 0, status: "success" });
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "发送中..." }),
      ).not.toBeInTheDocument();
    });
  });

  it("验证码次数耗尽后重新发送会恢复提交", async () => {
    const props = createDefaultProps();
    props.requestOtpAction
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" })
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" });
    props.submitOtpAction.mockResolvedValue({
      error: "验证码尝试次数已用尽，请重新获取验证码。",
      remainingAttempts: 0,
      status: "too_many_attempts",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.change(await screen.findByLabelText(/验证码/), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    expect(
      await screen.findByText("验证码尝试次数已用尽，请重新获取验证码。"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "完成注册" })).toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    await waitFor(() => {
      expect(props.requestOtpAction).toHaveBeenCalledTimes(2);
    });
    fireEvent.change(screen.getByLabelText(/验证码/), {
      target: { value: "123456" },
    });

    expect(screen.getByRole("button", { name: "完成注册" })).toBeEnabled();
  });

  it("验证码次数耗尽后重发失败仍锁定，再次重发成功后恢复提交", async () => {
    const props = createDefaultProps();
    props.requestOtpAction
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" })
      .mockResolvedValueOnce({
        error: "验证码发送过于频繁，请稍后再试",
        retryAfterSeconds: 0,
        status: "rate_limited",
      })
      .mockResolvedValueOnce({ retryAfterSeconds: 0, status: "success" });
    props.submitOtpAction.mockResolvedValue({
      error: "验证码尝试次数已用尽，请重新获取验证码。",
      remainingAttempts: 0,
      status: "too_many_attempts",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.change(await screen.findByLabelText(/验证码/), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    expect(
      await screen.findByText("验证码尝试次数已用尽，请重新获取验证码。"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "完成注册" })).toBeDisabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));

    expect(
      await screen.findByText("验证码发送过于频繁，请稍后再试"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完成注册" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "重新发送验证码" }),
      ).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "重新发送验证码" }));
    fireEvent.change(screen.getByLabelText(/验证码/), {
      target: { value: "123456" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "完成注册" })).toBeEnabled();
    });
  });

  it("注册成功跳转前锁定 OTP 操作", async () => {
    const props = createDefaultProps();
    props.requestOtpAction.mockResolvedValue({ status: "success" });
    props.submitOtpAction.mockResolvedValue({
      redirectTo: "/login?email=yamada%40example.test",
      status: "success",
      success: "注册完成。",
    });
    render(<RegisterForm {...props} />);

    await fillRegisterFields();
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));
    fireEvent.change(await screen.findByLabelText(/验证码/), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    expect(
      await screen.findByText("注册完成，正在跳转..."),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "完成注册" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "修改注册信息" })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "重新发送验证码" }),
    ).not.toBeInTheDocument();
  });
});
