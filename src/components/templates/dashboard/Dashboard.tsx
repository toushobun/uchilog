"use client";

import Stack from "@mui/material/Stack";

import { DashboardMonthSummaryCard } from "dashboard/DashboardMonthSummaryCard";
import { DashboardPeriodExpenses } from "dashboard/DashboardPeriodExpenses";
import { DashboardRecentTransactions } from "dashboard/DashboardRecentTransactions";
import type { DashboardViewData } from "types/dashboard";

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

      <DashboardPeriodExpenses
        todayExpense={todayExpense}
        weekExpense={weekExpense}
      />
    </Stack>
  );
}
