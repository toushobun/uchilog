import Stack from "@mui/material/Stack";

import { PeriodExpenseCard } from "dashboard-molecules/PeriodExpenseCard";

type DashboardPeriodExpensesProps = {
  todayExpense: {
    expense: string;
    recordCount: number;
  };
  weekExpense: {
    expense: string;
    recordCount: number;
  };
};

export function DashboardPeriodExpenses({
  todayExpense,
  weekExpense,
}: DashboardPeriodExpensesProps) {
  return (
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
  );
}
