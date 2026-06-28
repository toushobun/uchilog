import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  EditTransactionTemplate,
  EditTransferTransactionTemplate,
  NewTransactionTemplate,
} from "./TransactionFormPage";
import { NewTransactionVisualFrame } from "./NewTransactionVisualFrame";

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
  {
    id: "00000000-0000-4000-8000-000000001002",
    name: "共達",
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

async function noopAction() {}

const baseArgs = {
  accountOptions,
  action: noopAction,
  categoryOptions,
  errorMessage: null,
  ledgerName: "家庭账本",
  merchantOptions,
  tagOptions,
};

const meta = {
  title: "Templates/Transactions/TransactionFormPage",
  component: NewTransactionTemplate,
  decorators: [
    (Story) => (
      <NewTransactionVisualFrame>
        <Story />
      </NewTransactionVisualFrame>
    ),
  ],
  args: baseArgs,
} satisfies Meta<typeof NewTransactionTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "新增记账页面",
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

export const EditExpenseConvert: Story = {
  name: "编辑支出：可切换到转账",
  render: () => (
    <EditTransactionTemplate
      {...baseArgs}
      initialValues={{
        accountId: "00000000-0000-4000-8000-000000000045",
        items: [
          {
            amount: "1200",
            categoryId: "00000000-0000-4000-8000-000000005072",
          },
        ],
        merchantId: "00000000-0000-4000-8000-000000001001",
        note: "普通交易编辑示例",
        tagNames: ["日常"],
        transactionAt: "2026-06-05T03:20:10.000Z",
        transactionRecordId: "00000000-0000-4000-8000-000000009001",
        type: "expense",
      }}
    />
  ),
};

export const EditIncomeConvert: Story = {
  name: "编辑收入：可切换到转账",
  render: () => (
    <EditTransactionTemplate
      {...baseArgs}
      initialValues={{
        accountId: "00000000-0000-4000-8000-000000000046",
        items: [
          {
            amount: "260000",
            categoryId: "00000000-0000-4000-8000-000000005073",
          },
        ],
        merchantId: "00000000-0000-4000-8000-000000001002",
        note: "收入交易编辑示例",
        tagNames: ["公司"],
        transactionAt: "2026-06-05T03:20:10.000Z",
        transactionRecordId: "00000000-0000-4000-8000-000000009002",
        type: "income",
      }}
    />
  ),
};

export const EditTransferConvert: Story = {
  name: "编辑记账：转账类型可切换到支出或收入",
  render: () => (
    <EditTransferTransactionTemplate
      {...baseArgs}
      initialValues={{
        accountId: "00000000-0000-4000-8000-000000000045",
        note: "转账编辑示例",
        transactionAt: "2026-06-05T03:20:10.000Z",
        transactionRecordId: "00000000-0000-4000-8000-000000009003",
        transferAmount: "5000",
        transferTargetAccountId: "00000000-0000-4000-8000-000000000046",
        type: "transfer",
      }}
    />
  ),
};
