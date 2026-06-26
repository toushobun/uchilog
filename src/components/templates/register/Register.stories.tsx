import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { turnstileTestSiteKey } from "config/turnstile";
import { installTurnstileTestDouble } from "organisms/auth/turnstileTestDouble";
import type {
  RegisterEmailAvailabilityState,
  RequestRegisterOtpActionState,
  SubmitRegisterOtpActionState,
} from "types/auth";

import { RegisterTemplate } from "./Register";

async function defaultRequestOtpAction(): Promise<RequestRegisterOtpActionState> {
  return {};
}

async function defaultCheckEmailAvailabilityAction(): Promise<RegisterEmailAvailabilityState> {
  return { available: true };
}

async function defaultSubmitOtpAction(): Promise<SubmitRegisterOtpActionState> {
  return {};
}

const meta = {
  title: "Templates/Register/RegisterTemplate",
  component: RegisterTemplate,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/register",
      },
    },
  },
  decorators: [
    (Story) => {
      installTurnstileTestDouble();
      return <Story />;
    },
  ],
  args: {
    checkEmailAvailabilityAction: defaultCheckEmailAvailabilityAction,
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
    initialRequestOtpState: {
      error: "验证码发送失败，请稍后再试。",
    },
  },
};

export const WithSuccess: Story = {
  name: "含成功提示",
  args: {
    initialRequestOtpState: {
      success: "验证码已发送。",
    },
  },
};
