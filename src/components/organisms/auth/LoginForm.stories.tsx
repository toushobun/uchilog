import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoginForm } from "./LoginForm";

const meta = {
  title: "Organisms/Auth/LoginForm",
  component: LoginForm,
  args: {
    action: async () => ({}),
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认",
};

export const WithError: Story = {
  name: "含登录失败提示",
  args: {
    action: async () => ({ error: "邮箱或密码不正确。" }),
  },
};
