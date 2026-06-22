import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { TransactionTypeNavigation } from "./TransactionTypeNavigation";

const meta = {
  title: "Molecules/Transactions/TransactionTypeNavigation",
  component: TransactionTypeNavigation,
  render: function TransactionTypeNavigationStory(args) {
    const [activeType, setActiveType] = useState(args.activeType);

    return (
      <TransactionTypeNavigation
        {...args}
        activeType={activeType}
        onChange={setActiveType}
      />
    );
  },
  args: {
    activeType: "expense",
    onChange: () => undefined,
  },
} satisfies Meta<typeof TransactionTypeNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expense: Story = {
  name: "支出选中",
  args: { activeType: "expense" },
};

export const Income: Story = {
  name: "收入选中",
  args: { activeType: "income" },
};

export const Transfer: Story = {
  name: "转账选中",
  args: { activeType: "transfer" },
};
