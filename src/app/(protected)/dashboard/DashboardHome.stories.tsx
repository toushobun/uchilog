import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardHome } from "./DashboardHome";

const meta = {
  title: "Dashboard/DashboardHome",
  component: DashboardHome,
  args: {
    data: {
      ledgerName: "家庭账本",
      monthLabel: "2026年6月",
      monthSummary: {
        balance: "180000",
        currency: "JPY",
        expense: "80000",
        income: "260000",
      },
      recentTransactions: [],
      todayExpense: { expense: "331", currency: "JPY", recordCount: 2 },
      weekExpense: { expense: "2840", currency: "JPY", recordCount: 8 },
    },
  },
} satisfies Meta<typeof DashboardHome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
