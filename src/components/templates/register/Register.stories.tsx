import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { turnstileTestSiteKey } from "config/turnstile";
import { installTurnstileTestDouble } from "organisms/auth/turnstileTestDouble";
import type {
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import { RegisterTemplate } from "./Register";

async function defaultRequestOtpAction(): Promise<RequestRegisterOtpActionState> {
  return {};
}

async function defaultSubmitOtpAction(): Promise<SubmitRegisterOtpActionState> {
  return {};
}

async function errorRequestOtpAction(): Promise<RequestRegisterOtpActionState> {
  return { error: "验证码发送失败，请稍后再试。" };
}

async function successRequestOtpAction(): Promise<RequestRegisterOtpActionState> {
  return {
    status: "success",
    success: "验证码已发送。",
  };
}

const meta = {
  title: "Templates/Register/RegisterTemplate",
  component: RegisterTemplate,
  decorators: [
    (Story) => {
      installTurnstileTestDouble();
      return <Story />;
    },
  ],
  args: {
    requestOtpAction: defaultRequestOtpAction,
    submitOtpAction: defaultSubmitOtpAction,
    turnstileSiteKey: turnstileTestSiteKey,
  },
} satisfies Meta<typeof RegisterTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "注册页面",
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    requestOtpAction: errorRequestOtpAction,
  },
};

export const WithSuccess: Story = {
  name: "含成功提示",
  args: {
    requestOtpAction: successRequestOtpAction,
  },
};
