import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AccountHolderOption, AccountRow } from "types/accounts";

import { AccountList } from "./AccountList";

const holderOptions: AccountHolderOption[] = [
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
    name: "日元现金",
    type: "cash",
    currency: "JPY",
    initial_balance: 10000,
    current_balance: 4560,
    sort_order: 2,
    created_at: "2026-01-02T00:00:00.000Z",
    holders: [],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "楽天カード",
    type: "credit_card",
    currency: "JPY",
    initial_balance: 0,
    current_balance: -12500,
    sort_order: 3,
    created_at: "2026-01-03T00:00:00.000Z",
    holders: [
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
];

const meta = {
  title: "Organisms/Accounts/AccountList",
  component: AccountList,
  args: {
    accounts,
    holderOptions,
    archiveAccountAction: async () => {},
    updateAccountAction: async () => {},
  },
} satisfies Meta<typeof AccountList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "账户列表",
};

export const Empty: Story = {
  name: "空列表",
  args: {
    accounts: [],
  },
};
