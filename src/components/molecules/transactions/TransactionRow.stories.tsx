import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionRow } from "./TransactionRow";

const baseItem = {
  id: "00000000-0000-4000-8000-000000009001",
  type: "expense" as const,
  transaction_at: "2026-06-05T03:20:10.000Z",
  amount: "1234",
  account_name: "日元现金",
  account_currency: "JPY",
  categoryItems: [
    { categoryName: "餐饮", parentCategoryName: "饮食", amount: "1234" },
  ],
  merchant_name: "便利店",
  merchant_icon_url: null,
  note: "测试备注",
  recorder_name: "淞文",
};

const meta = {
  title: "Molecules/Transactions/TransactionRow",
  component: TransactionRow,
  args: {
    item: baseItem,
  },
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expense: Story = {
  name: "支出记录",
  args: {
    showAccount: true,
    showTime: true,
    showNote: true,
  },
};

export const Income: Story = {
  name: "收入记录",
  args: {
    item: {
      ...baseItem,
      type: "income",
      amount: "260000",
      merchant_name: "工资",
      categoryItems: [
        { categoryName: "固定工资", parentCategoryName: "收入", amount: "260000" },
      ],
    },
    showAccount: true,
    showTime: true,
    showType: true,
  },
};

export const WithVoidAction: Story = {
  name: "带撤销按钮",
  args: {
    showAccount: true,
    showNote: true,
    voidAction: async () => {},
  },
};
