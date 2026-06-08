import Stack from "@mui/material/Stack";

import { DashboardMonthSummaryCard } from "organisms/dashboard/DashboardMonthSummaryCard";
import { DashboardPeriodExpenses } from "organisms/dashboard/DashboardPeriodExpenses";
import { DashboardRecentTransactions } from "organisms/dashboard/DashboardRecentTransactions";
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
