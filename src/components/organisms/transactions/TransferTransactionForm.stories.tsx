import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransferTransactionForm } from "./TransferTransactionForm";

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
  {
    id: "00000000-0000-4000-8000-000000000047",
    name: "备用美元账户",
    currency: "USD",
  },
];

const archivedAccountOption = {
  id: "00000000-0000-4000-8000-000000000048",
  name: "旧现金（已归档）",
  currency: "JPY",
  isArchived: true,
};

async function noopAction() {}

const meta = {
  title: "Organisms/Transactions/TransferTransactionForm",
  component: TransferTransactionForm,
  args: {
    action: noopAction,
    accountOptions,
    ledgerName: "家庭账本",
  },
} satisfies Meta<typeof TransferTransactionForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认新增",
};

export const InsufficientAccounts: Story = {
  name: "账户不足",
  args: {
    accountOptions: [accountOptions[0]],
  },
};

export const EditMode: Story = {
  name: "编辑回填",
  args: {
    initialValues: {
      accountId: "00000000-0000-4000-8000-000000000045",
      note: "月底把现金存入银行",
      transactionAt: "2026-06-05T03:20:10.000Z",
      transactionRecordId: "00000000-0000-4000-8000-000000009001",
      transferAmount: "1200",
      transferTargetAccountId: "00000000-0000-4000-8000-000000000046",
    },
    title: "编辑转账",
  },
};

export const ArchivedAccountEditMode: Story = {
  name: "编辑回填已归档账户",
  args: {
    accountOptions: [...accountOptions, archivedAccountOption],
    initialValues: {
      accountId: archivedAccountOption.id,
      note: "旧账户转账",
      transactionAt: "2026-06-05T03:20:10.000Z",
      transactionRecordId: "00000000-0000-4000-8000-000000009001",
      transferAmount: "1200",
      transferTargetAccountId: "00000000-0000-4000-8000-000000000046",
    },
    title: "编辑转账",
  },
};

export const WithError: Story = {
  name: "错误提示",
  args: {
    errorMessage: "保存转账失败。请稍后重试。",
  },
};
