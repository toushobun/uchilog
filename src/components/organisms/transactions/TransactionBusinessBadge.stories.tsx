import Stack from "@mui/material/Stack";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionBusinessBadge } from "./TransactionBusinessBadge";

function TransactionBusinessBadgePreview() {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      <TransactionBusinessBadge status="pendingReimbursement" />
      <TransactionBusinessBadge status="pendingRefund" />
      <TransactionBusinessBadge status="reimbursed" />
      <TransactionBusinessBadge status="refunded" />
      <TransactionBusinessBadge status="excluded" />
    </Stack>
  );
}

const meta = {
  title: "Organisms/Transactions/TransactionBusinessBadge",
  component: TransactionBusinessBadgePreview,
} satisfies Meta<typeof TransactionBusinessBadgePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认状态",
  render: () => <TransactionBusinessBadgePreview />,
};

export const CustomLabel: Story = {
  name: "自定义文案",
  render: () => (
    <TransactionBusinessBadge
      label="公司报销中"
      status="pendingReimbursement"
    />
  ),
};
