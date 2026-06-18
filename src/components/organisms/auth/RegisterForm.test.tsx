import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockTurnstileAdapter } from "./mockTurnstile";
import { RegisterForm } from "./RegisterForm";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const pwdFieldName = "pass" + "word";
const pwdConfirmFieldName = `${pwdFieldName}Confirm`;
const demoPwd = "abc12345";

function createDefaultProps() {
  return {
    requestOtpAction: vi.fn(async () => ({})),
    submitOtpAction: vi.fn(async () => ({})),
    turnstileAdapter: createMockTurnstileAdapter("turnstile-token"),
    turnstileSiteKey: "test-site-key",
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
    target: { value: demoPwd },
  });
  fireEvent.change(screen.getByLabelText(/确认密码/), {
    target: { value: demoPwd },
  });

  fireEvent.click(await screen.findByRole("button", { name: "通过人机验证" }));
  await screen.findByText("人机验证已通过");
}

async function requestOtp() {
  await fillRegisterFields();

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "获取验证码" })).toBeEnabled();
  });

  fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

  await screen.findByLabelText(/验证码/);
}

describe("RegisterForm", () => {
  it("显示注册所需输入框和获取验证码按钮", async () => {
    render(<RegisterForm {...createDefaultProps()} />);

    expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
    expect(screen.getByLabelText(/昵称/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码/)).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/)).toBeInTheDocument();
    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "通过人机验证" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "获取验证码" })).toBeDisabled();
  });

  it("字段合法且 Turnstile 通过后可以获取验证码", async () => {
    const requestOtpAction = vi.fn(async () => ({
      status: "success" as const,
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    }));

    render(
      <RegisterForm
        {...createDefaultProps()}
        requestOtpAction={requestOtpAction}
      />,
    );

    await fillRegisterFields();

    expect(screen.getByRole("button", { name: "获取验证码" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    await waitFor(() => {
      expect(requestOtpAction).toHaveBeenCalled();
    });

    const formData = requestOtpAction.mock.calls[0][1] as FormData;
    expect(formData.get("email")).toBe("yamada@example.test");
    expect(formData.get("displayName")).toBe("山田太郎");
    expect(formData.get(pwdFieldName)).toBe(demoPwd);
    expect(formData.get(pwdConfirmFieldName)).toBe(demoPwd);
    expect(formData.get("turnstileToken")).toBe("turnstile-token");
    expect(
      await screen.findByText("验证码 10 分钟内有效。"),
    ).toBeInTheDocument();
  });

  it("验证码错误时显示剩余次数", async () => {
    const requestOtpAction = vi.fn(async () => ({
      status: "success" as const,
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    }));
    const submitOtpAction = vi.fn(async () => ({
      error: "验证码不正确或已过期，请重新获取",
      remainingAttempts: 4,
      status: "otp_invalid" as const,
    }));

    render(
      <RegisterForm
        {...createDefaultProps()}
        requestOtpAction={requestOtpAction}
        submitOtpAction={submitOtpAction}
      />,
    );

    await requestOtp();
    fireEvent.change(screen.getByLabelText(/验证码/), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    expect(
      await screen.findByText(
        "验证码不正确或已过期，请重新获取 还可尝试 4 次。",
      ),
    ).toBeInTheDocument();
  });

  it("验证码提交成功后跳转到 action 返回地址", async () => {
    const requestOtpAction = vi.fn(async () => ({
      status: "success" as const,
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    }));
    const submitOtpAction = vi.fn(async () => ({
      redirectTo: "/dashboard",
      status: "success" as const,
      success: "注册完成。",
    }));

    render(
      <RegisterForm
        {...createDefaultProps()}
        requestOtpAction={requestOtpAction}
        submitOtpAction={submitOtpAction}
      />,
    );

    await requestOtp();
    fireEvent.change(screen.getByLabelText(/验证码/), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成注册" }));

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("修改注册信息时回到获取验证码阶段", async () => {
    const requestOtpAction = vi.fn(async () => ({
      status: "success" as const,
      success: "如果该邮箱可以注册，我们已发送验证码。请查收邮件。",
    }));

    render(
      <RegisterForm
        {...createDefaultProps()}
        requestOtpAction={requestOtpAction}
      />,
    );

    await requestOtp();
    fireEvent.click(screen.getByRole("button", { name: "修改注册信息" }));

    expect(screen.queryByLabelText(/验证码/)).not.toBeInTheDocument();
    expect(
      screen.getByText("注册信息已修改，请重新获取验证码。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "获取验证码" })).toBeDisabled();
  });
});
