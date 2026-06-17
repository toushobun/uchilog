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
    parentId: "00000000-0000-4000-8000-000000005001",
    parentName: "食材/调料",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005073",
    name: "交通",
    parentId: "00000000-0000-4000-8000-000000005002",
    parentName: "交通出行",
    type: "expense" as const,
  },
  {
    id: "00000000-0000-4000-8000-000000005074",
    name: "工资",
    parentId: "00000000-0000-4000-8000-000000005003",
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
  {
    id: "00000000-0000-4000-8000-000000001002",
    name: "超市",
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
  {
    id: "00000000-0000-4000-8000-000000003003",
    name: "结婚",
    color: "#A45230",
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
    ledgerName: "家庭账本",
    merchantOptions,
    tagOptions,
  },
} satisfies Meta<typeof TransactionForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTags: Story = {
  args: {
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000045",
      items: [
        {
          amount: "1200",
          categoryId: "00000000-0000-4000-8000-000000005072",
        },
      ],
      merchantId: "00000000-0000-4000-8000-000000001001",
      note: "带标签的记账示例",
      tagNames: ["日常", "结婚"],
      transactionAt: "2026-06-05T03:20:10.000Z",
      type: "expense",
    },
  },
};

export const EditMode: Story = {
  args: {
    formId: "edit-transaction-form",
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000045",
      items: [
        {
          amount: "1200",
          categoryId: "00000000-0000-4000-8000-000000005072",
        },
        {
          amount: "0",
          categoryId: "00000000-0000-4000-8000-000000005073",
        },
      ],
      merchantId: "00000000-0000-4000-8000-000000001001",
      note: "编辑前已有备注",
      tagNames: ["日常"],
      transactionAt: "2026-06-05T03:20:10.000Z",
      transactionRecordId: "00000000-0000-4000-8000-000000009001",
      type: "expense",
    },
    submitLabel: "保存修改",
    title: "编辑记账",
  },
};

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
    tagOptions: [],
  },
};
