import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionForm } from "./TransactionForm";

const accountOptions = [
  {
    id: "00000000-0000-4000-8000-000000000045",
    name: "日元现金",
    currency: "JPY",
  },
  {
    id: "00000000-0000-4000-8000-000000000046",
    name: "三井住友银行",
    currency: "JPY",
  },
];

const categoryOptions = [
  {
    id: "00000000-0000-4000-8000-000000005072",
    name: "餐饮",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "交通",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005074",
    name: "工资",
    type: "income" as const,
  },
];

const merchantOptions = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "便利店",
    icon_url: null,
  },
  {
    id: "00000000-0000-4000-8000-000000001002",
    name: "超市",
    icon_url: null,
  },
];

async function noopAction() {}

const meta = {
  title: "Organisms/Transactions/TransactionForm",
  component: TransactionForm,
  args: {
    action: noopAction,
    accountOptions,
    categoryOptions,
    merchantOptions,
  },
} satisfies Meta<typeof TransactionForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    errorMessage: "新增记账失败。请稍后重试。",
  },
};

export const EmptyOptions: Story = {
  args: {
    accountOptions: [],
    categoryOptions: [],
    merchantOptions: [],
  },
};
