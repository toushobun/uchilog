import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionFormHeader } from "./TransactionFormHeader";

const meta = {
  title: "Organisms/Transactions/TransactionFormHeader",
  component: TransactionFormHeader,
  args: {
    closeHref: "/transactions",
    isSubmitDisabled: false,
    ledgerName: "家庭账本",
    title: "新增记账",
  },
} satisfies Meta<typeof TransactionFormHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认状态（保存可用）",
};

export const SaveDisabled: Story = {
  name: "保存按钮禁用",
  args: {
    isSubmitDisabled: true,
  },
};

export const NoLedgerName: Story = {
  name: "不显示账本名",
  args: {
    ledgerName: undefined,
  },
};
