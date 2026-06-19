import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, waitFor, within } from "storybook/test";

import { turnstileTestSiteKey } from "config/turnstile";

import { RegisterForm } from "./RegisterForm";
import { installTurnstileTestDouble } from "./turnstileTestDouble";

const meta: Meta<typeof RegisterForm> = {
  title: "Organisms/Auth/RegisterForm",
  component: RegisterForm,
  decorators: [
    (Story) => {
      installTurnstileTestDouble();
      return <Story />;
    },
  ],
  args: {
    checkEmailAvailabilityAction: async () => ({ available: true }),
    requestOtpAction: async () => ({}),
    submitOtpAction: async () => ({}),
    turnstileSiteKey: turnstileTestSiteKey,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

async function fillRegisterFields(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  await userEvent.type(canvas.getByLabelText(/邮箱/), "yamada@example.test");
  await userEvent.type(canvas.getByLabelText(/昵称/), "山田太郎");
  await userEvent.type(canvas.getByLabelText(/^密码/), "password123");
  await userEvent.type(canvas.getByLabelText(/确认密码/), "password123");
  await waitFor(() => {
    if (
      canvas
        .getByRole("button", { name: "获取验证码" })
        .hasAttribute("disabled")
    ) {
      throw new Error("等待 Turnstile 响应");
    }
  });
}

export const Default: Story = {
  name: "初始填写",
};

export const EmailAlreadyRegistered: Story = {
  name: "邮箱已注册",
  args: {
    checkEmailAvailabilityAction: async () => ({
      available: false,
      error: "这个邮箱已经注册过了，请直接登录或换一个邮箱。",
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText(/邮箱/),
      "registered@example.test",
    );
    await userEvent.tab();
    await canvas.findByText("这个邮箱已经注册过了，请直接登录或换一个邮箱。");
  },
};

export const OtpInput: Story = {
  name: "OTP 输入",
  args: {
    requestOtpAction: async () => ({
      status: "success",
      success: "验证码已发送。",
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillRegisterFields(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "获取验证码" }));
  },
};

export const ResendReady: Story = {
  name: "重新发送",
  args: {
    requestOtpAction: async () => ({
      retryAfterSeconds: 0,
      status: "success",
      success: "验证码已发送。",
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillRegisterFields(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "获取验证码" }));
  },
};

export const SubmitError: Story = {
  name: "验证码错误",
  args: {
    requestOtpAction: async () => ({ status: "success" }),
    submitOtpAction: async () => ({
      error: "验证码不正确或已过期，请重新获取",
      remainingAttempts: 4,
      status: "otp_invalid",
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillRegisterFields(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "获取验证码" }));
    await userEvent.type(await canvas.findByLabelText(/验证码/), "012345");
    await userEvent.click(canvas.getByRole("button", { name: "完成注册" }));
  },
};
