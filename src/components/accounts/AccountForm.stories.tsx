import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccountForm } from "./AccountForm";

const holderOptions = [
  {
    user_id: "user-1",
    display_name: "本地开发用户",
    email: "local1@example.test",
  },
  {
    user_id: "user-2",
    display_name: "本地开发用户2",
    email: "local2@example.test",
  },
];

const meta: Meta<typeof AccountForm> = {
  component: AccountForm,
  title: "Accounts/AccountForm",
};

export default meta;
type Story = StoryObj<typeof AccountForm>;

export const WithoutHolderInitialState: Story = {
  name: "无持有人初始状态",
  args: {
    createAccountAction: async () => {},
    defaultCurrency: "JPY",
    holderOptions,
  },
};
