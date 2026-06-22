import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransferTransactionForm } from "./TransferTransactionForm";

const jpyAccount1 = {
  id: "00000000-0000-4000-8000-000000000045",
  name: "日元现金",
  currency: "JPY",
};

const jpyAccount2 = {
  id: "00000000-0000-4000-8000-000000000046",
  name: "三井住友银行",
  currency: "JPY",
};

const usdAccount = {
  id: "00000000-0000-4000-8000-000000000047",
  name: "美元账户",
  currency: "USD",
};

async function noopAction() {}

const meta = {
  title: "Organisms/Transactions/TransferTransactionForm",
  component: TransferTransactionForm,
  args: {
    action: noopAction,
    accountOptions: [jpyAccount1, jpyAccount2],
    ledgerName: "家庭账本",
  },
} satisfies Meta<typeof TransferTransactionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认状态（同币种两账户）",
};

export const TooFewAccounts: Story = {
  name: "账户不足 2 个",
  args: {
    accountOptions: [jpyAccount1],
  },
};

export const NoAccounts: Story = {
  name: "无账户",
  args: {
    accountOptions: [],
  },
};

export const DifferentCurrency: Story = {
  name: "不同币种账户",
  args: {
    accountOptions: [jpyAccount1, usdAccount],
  },
};

export const WithError: Story = {
  name: "带错误信息",
  args: {
    errorMessage: "转账失败。请稍后重试。",
  },
};
