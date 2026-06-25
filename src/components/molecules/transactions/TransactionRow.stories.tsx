import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { TransactionRowItem } from "types/transactions";

import { TransactionRow } from "./TransactionRow";

const expenseItem: TransactionRowItem = {
  id: "00000000-0000-4000-8000-000000009001",
  type: "expense",
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
  tagNames: [],
};

const incomeItem: TransactionRowItem = {
  id: "00000000-0000-4000-8000-000000009002",
  type: "income",
  transaction_at: "2026-06-01T09:00:00.000Z",
  amount: "260000",
  account_name: "📘 Debit",
  account_currency: "JPY",
  categoryItems: [
    { categoryName: "固定工资", parentCategoryName: "收入", amount: "260000" },
  ],
  merchant_name: "工资",
  merchant_icon_url: null,
  note: null,
  recorder_name: null,
  tagNames: [],
};

const meta = {
  title: "Molecules/Transactions/TransactionRow",
  component: TransactionRow,
  args: {
    item: expenseItem,
  },
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExpenseFull: Story = {
  name: "支出记录（全字段展示）",
  args: {
    showType: true,
    showAccount: true,
    showTime: true,
    showNote: true,
    showRecorder: true,
  },
};

export const ExpenseMinimal: Story = {
  name: "支出记录（最简展示）",
};

export const Income: Story = {
  name: "收入记录",
  args: {
    item: incomeItem,
    showType: true,
    showAccount: true,
  },
};

export const WithVoidAction: Story = {
  name: "带删除按钮",
  args: {
    showType: true,
    voidAction: async () => {},
  },
};

export const NoMerchant: Story = {
  name: "无商家",
  args: {
    item: {
      ...expenseItem,
      merchant_name: null,
      merchant_icon_url: null,
    },
    showType: true,
  },
};

export const MultipleCategories: Story = {
  name: "多分类",
  args: {
    item: {
      ...expenseItem,
      categoryItems: [
        { categoryName: "餐饮", parentCategoryName: "饮食", amount: "800" },
        { categoryName: "日用品", parentCategoryName: "购物", amount: "434" },
      ],
    },
    showType: true,
  },
};
