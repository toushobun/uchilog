import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoginTemplate } from "./Login";

async function defaultAction() {
  return {};
}

async function errorAction() {
  return { error: "邮箱或密码错误。" };
}

const meta = {
  title: "Templates/Login/LoginTemplate",
  component: LoginTemplate,
  args: {
    action: defaultAction,
  },
} satisfies Meta<typeof LoginTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "登录页面",
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    action: errorAction,
  },
};
