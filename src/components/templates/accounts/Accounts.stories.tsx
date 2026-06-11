import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AccountHolderOption, AccountRow } from "types/accounts";

import { AccountsTemplate } from "./Accounts";

const holderOptions: AccountHolderOption[] = [
  {
    user_id: "user-1",
    display_name: "本地开发用户",
    email: "local1@example.test",
  },
];

const accounts: AccountRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "三菱UFJ银行",
    type: "bank",
    currency: "JPY",
    initial_balance: 100000,
    current_balance: 85000,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00.000Z",
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
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "PayPay",
    type: "e_money",
    currency: "JPY",
    initial_balance: 0,
    current_balance: 3200,
    sort_order: 2,
    created_at: "2026-01-02T00:00:00.000Z",
    holders: [],
  },
];

const meta = {
  title: "Templates/Accounts/AccountsTemplate",
  component: AccountsTemplate,
  args: {
    accounts,
    archiveAccountAction: async () => {},
    baseCurrency: "JPY",
    createAccountAction: async () => {},
    errorMessage: null,
    holderOptions,
    ledgerName: "家庭账本",
    updateAccountAction: async () => {},
  },
} satisfies Meta<typeof AccountsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "账户页面",
};

export const Empty: Story = {
  name: "无账户",
  args: {
    accounts: [],
  },
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    errorMessage: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  },
};
