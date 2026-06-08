"use client";

import Stack from "@mui/material/Stack";

import { PeriodExpenseCard } from "dashboard-molecules/PeriodExpenseCard";
import type { DashboardViewData } from "types/dashboard";

import { DashboardMonthSummaryCard } from "./DashboardMonthSummaryCard";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";

export function DashboardTemplate({ data }: { data: DashboardViewData }) {
  const {
    monthLabel,
    monthSummary,
    recentTransactions,
    todayExpense,
    weekExpense,
  } = data;

  return (
    <Stack spacing={2.5}>
      <DashboardMonthSummaryCard
        monthLabel={monthLabel}
        monthSummary={monthSummary}
      />

      <DashboardRecentTransactions transactions={recentTransactions} />

      <Stack direction="row" spacing={1.5}>
        <PeriodExpenseCard
          label="今日支出"
          expense={todayExpense.expense}
          recordCount={todayExpense.recordCount}
        />
        <PeriodExpenseCard
          label="本周支出"
          expense={weekExpense.expense}
          recordCount={weekExpense.recordCount}
        />
      </Stack>
    </Stack>
  );
}
