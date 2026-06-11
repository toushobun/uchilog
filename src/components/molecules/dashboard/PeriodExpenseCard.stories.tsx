import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PeriodExpenseCard } from "./PeriodExpenseCard";

const meta = {
  title: "Molecules/Dashboard/PeriodExpenseCard",
  component: PeriodExpenseCard,
  args: {
    label: "今日支出",
    expense: "3200",
    recordCount: 5,
  },
} satisfies Meta<typeof PeriodExpenseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "周期支出卡片",
};

export const Weekly: Story = {
  name: "本周支出",
  args: {
    label: "本周支出",
    expense: "18500",
    recordCount: 12,
  },
};

export const Zero: Story = {
  name: "无支出",
  args: {
    label: "今日支出",
    expense: "0",
    recordCount: 0,
  },
};
