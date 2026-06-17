import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NewTransactionTemplate } from "./TransactionFormPage";

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
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "工资",
    parentId: "00000000-0000-4000-8000-000000005002",
    parentName: "固定收入",
    type: "income" as const,
  },
];

const merchantOptions = [
  {
    id: "00000000-0000-4000-8000-000000001001",
    name: "便利店",
    icon_url: null,
  },
];

const tagOptions = [
  {
    id: "00000000-0000-4000-8000-000000003001",
    name: "日常",
    color: null,
  },
  {
    id: "00000000-0000-4000-8000-000000003002",
    name: "公司",
    color: "#176A66",
  },
];

const meta = {
  title: "Templates/Transactions/TransactionFormPage",
  component: NewTransactionTemplate,
  args: {
    accountOptions,
    action: async () => {},
    categoryOptions,
    errorMessage: null,
    ledgerName: "家庭账本",
    merchantOptions,
    tagOptions,
  },
} satisfies Meta<typeof NewTransactionTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "新增记录页面",
};

export const WithError: Story = {
  name: "含错误提示",
  args: {
    errorMessage: "新增记账失败。请稍后重试。",
  },
};

export const EmptyOptions: Story = {
  name: "无账户和分类选项",
  args: {
    accountOptions: [],
    categoryOptions: [],
    merchantOptions: [],
    tagOptions: [],
  },
};
