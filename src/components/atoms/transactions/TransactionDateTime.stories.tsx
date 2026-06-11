import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionDateTime } from "./TransactionDateTime";

const meta = {
  title: "Atoms/Transactions/TransactionDateTime",
  component: TransactionDateTime,
  args: {
    value: "2026-06-05T03:20:10.000Z",
  },
} satisfies Meta<typeof TransactionDateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "交易时间",
};
