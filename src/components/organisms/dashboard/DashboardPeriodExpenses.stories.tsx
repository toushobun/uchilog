import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createDashboardPeriodExpense } from "@/test/mocks/dashboard";

import { DashboardPeriodExpenses } from "./DashboardPeriodExpenses";

const meta = {
  title: "Organisms/Dashboard/PeriodExpenses",
  component: DashboardPeriodExpenses,
  args: {
    todayExpense: createDashboardPeriodExpense(),
    weekExpense: createDashboardPeriodExpense({
      expense: "2840",
      recordCount: 8,
    }),
  },
} satisfies Meta<typeof DashboardPeriodExpenses>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "今日・本周支出",
};
