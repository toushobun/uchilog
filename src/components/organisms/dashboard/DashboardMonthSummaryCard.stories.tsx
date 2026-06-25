import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createDashboardAccountSummary } from "@/test/mocks/dashboard";

import { DashboardMonthSummaryCard } from "./DashboardMonthSummaryCard";

const meta = {
  title: "Organisms/Dashboard/MonthSummaryCard",
  component: DashboardMonthSummaryCard,
  args: {
    accounts: [createDashboardAccountSummary()],
    monthLabel: "2026年5月",
  },
} satisfies Meta<typeof DashboardMonthSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "月度汇总卡",
};
