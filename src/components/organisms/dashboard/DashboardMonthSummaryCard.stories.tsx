import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createDashboardAmountSummary } from "@/test/mocks/dashboard";

import { DashboardMonthSummaryCard } from "./DashboardMonthSummaryCard";

const meta = {
  title: "Organisms/Dashboard/MonthSummaryCard",
  component: DashboardMonthSummaryCard,
  args: {
    monthLabel: "2026年5月",
    monthSummary: createDashboardAmountSummary(),
  },
} satisfies Meta<typeof DashboardMonthSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "月度汇总卡",
};
