import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionSummaryBar } from "./TransactionSummaryBar";

const meta = {
  title: "Molecules/Transactions/TransactionSummaryBar",
  component: TransactionSummaryBar,
  args: {
    summary: {
      currency: "JPY",
      income: "260000",
      expense: "80000",
      balance: "180000",
    },
  },
} satisfies Meta<typeof TransactionSummaryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "收支汇总栏",
};

export const Zero: Story = {
  name: "全部为零",
  args: {
    summary: {
      currency: "JPY",
      income: "0",
      expense: "0",
      balance: "0",
    },
  },
};

export const NegativeBalance: Story = {
  name: "结余为负",
  args: {
    summary: {
      currency: "JPY",
      income: "10000",
      expense: "15000",
      balance: "-5000",
    },
  },
};
