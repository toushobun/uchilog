import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionListRow } from "./TransactionListRow";

const expenseItem = {
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
  recorder_name: null,
  created_at: "2026-06-05T03:20:10.000Z",
};

const incomeItem = {
  ...expenseItem,
  id: "00000000-0000-4000-8000-000000009002",
  type: "income" as const,
  amount: "120000",
  categoryItems: [
    { categoryName: "工资", parentCategoryName: null, amount: "120000" },
  ],
  merchant_name: "共達",
  note: null,
};

const meta = {
  title: "Organisms/Transactions/TransactionListRow",
  component: TransactionListRow,
  args: {
    item: expenseItem,
  },
} satisfies Meta<typeof TransactionListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expense: Story = {
  name: "支出记录",
};

export const Income: Story = {
  name: "收入记录",
  args: {
    item: incomeItem,
  },
};

export const WithVoidAction: Story = {
  name: "带撤销按钮",
  args: {
    voidAction: (formData: FormData) => {
      console.info("void", formData.get("transactionRecordId"));
    },
  },
};

export const NoMerchant: Story = {
  name: "无商家信息",
  args: {
    item: { ...expenseItem, merchant_name: null },
  },
};
