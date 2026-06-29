import Stack from "@mui/material/Stack";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionBusinessBadge } from "./TransactionBusinessBadge";
import type { TransactionBusinessBadgeStatus } from "./transactionBusinessBadgeConfig";

const badgeStatuses: TransactionBusinessBadgeStatus[] = ["business", "excluded"];

function TransactionBusinessBadgePreview() {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {badgeStatuses.map((status) => (
        <TransactionBusinessBadge key={status} status={status} />
      ))}
    </Stack>
  );
}

const meta = {
  title: "Organisms/Transactions/TransactionBusinessBadge",
  component: TransactionBusinessBadge,
  argTypes: {
    status: {
      control: "select",
      options: badgeStatuses,
    },
  },
} satisfies Meta<typeof TransactionBusinessBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认状态",
  args: {
    status: "business",
  },
  render: () => <TransactionBusinessBadgePreview />,
};

export const CustomLabel: Story = {
  name: "自定义文案",
  args: {
    label: "业务记录",
    status: "business",
  },
};
