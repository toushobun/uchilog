import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccountEditForm } from "./AccountEditForm";

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

const baseAccount = {
  id: "account-1",
  name: "三菱UFJ银行",
  type: "bank",
  currency: "JPY",
  initial_balance: 100000,
  current_balance: 85000,
  sort_order: 0,
  created_at: "2026-06-03T00:00:00.000Z",
} as const;

const meta: Meta<typeof AccountEditForm> = {
  component: AccountEditForm,
  title: "Accounts/AccountEditForm",
};

export default meta;
type Story = StoryObj<typeof AccountEditForm>;

export const SingleHolderAccount: Story = {
  name: "单人持有账户",
  args: {
    account: {
      ...baseAccount,
      holders: [
        {
          id: "holder-1",
          user_id: "user-1",
          display_name: "本地开发用户",
          email: "local1@example.test",
          display_color: "sky",
          role: "owner",
          share_ratio: null,
        },
      ],
    },
    holderOptions,
    updateAccountAction: async () => {},
  },
};

export const SharedHolderAccount: Story = {
  name: "多人共同持有账户",
  args: {
    account: {
      ...baseAccount,
      name: "日元现金",
      type: "cash",
      holders: [
        {
          id: "holder-1",
          user_id: "user-1",
          display_name: "本地开发用户",
          email: "local1@example.test",
          display_color: "sky",
          role: "co_owner",
          share_ratio: null,
        },
        {
          id: "holder-2",
          user_id: "user-2",
          display_name: "本地开发用户2",
          email: "local2@example.test",
          display_color: "sakura",
          role: "co_owner",
          share_ratio: null,
        },
      ],
    },
    holderOptions,
    updateAccountAction: async () => {},
  },
};

export const InactiveHolderPreserved: Story = {
  name: "保留非活跃持有人",
  args: {
    account: {
      ...baseAccount,
      name: "旧信用卡",
      type: "credit_card",
      holders: [
        {
          id: "holder-1",
          user_id: "user-1",
          display_name: "本地开发用户",
          email: "local1@example.test",
          display_color: "sky",
          role: "owner",
          share_ratio: null,
        },
        {
          id: "holder-3",
          user_id: "user-3",
          display_name: "停用用户",
          email: "inactive@example.test",
          display_color: "amber",
          role: "co_owner",
          share_ratio: null,
        },
      ],
    },
    holderOptions,
    updateAccountAction: async () => {},
  },
};
