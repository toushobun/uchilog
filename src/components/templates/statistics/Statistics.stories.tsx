import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatisticsTemplate } from "./Statistics";

const defaultArgs = {
  categoryExpenseRanking: [
    {
      amount: "2500",
      id: "category-food",
      name: "食费 / 外食",
      transactionCount: 2,
    },
    {
      amount: "1200",
      id: "category-daily",
      name: "日用品",
      transactionCount: 1,
    },
  ],
  ledgerName: "家庭账本",
  merchantExpenseRanking: [
    {
      amount: "3000",
      id: "merchant-super",
      name: "超市",
      transactionCount: 2,
    },
    {
      amount: "700",
      id: "merchant-cafe",
      name: "咖啡店",
      transactionCount: 1,
    },
  ],
  month: "2026-06",
  monthLabel: "2026年6月",
  nextMonth: "2026-07",
  previousMonth: "2026-05",
  summary: {
    balance: "246700",
    currency: "JPY",
    expense: "3300",
    income: "250000",
  },
};

const meta = {
  title: "Templates/Statistics/StatisticsTemplate",
  component: StatisticsTemplate,
  args: defaultArgs,
} satisfies Meta<typeof StatisticsTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "统计页面",
};

export const Empty: Story = {
  args: {
    ...defaultArgs,
    categoryExpenseRanking: [],
    merchantExpenseRanking: [],
    summary: {
      balance: "0",
      currency: "JPY",
      expense: "0",
      income: "0",
    },
  },
  name: "无统计数据",
};
