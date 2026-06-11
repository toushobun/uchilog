import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  transactionAccentColor,
  transactionExpenseColor,
  transactionIncomeColor,
  transactionSummaryBackgroundColor,
} from "theme/transactionColors";
import type { DashboardAmountSummary } from "types/dashboard";
import { formatNumber } from "utils/transactions";

type DashboardMonthSummaryCardProps = {
  monthLabel: string;
  monthSummary: DashboardAmountSummary;
};

export function DashboardMonthSummaryCard({
  monthLabel,
  monthSummary,
}: DashboardMonthSummaryCardProps) {
  return (
    <Box
      sx={{
        bgcolor: transactionSummaryBackgroundColor,
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Typography
        sx={{
          color: transactionAccentColor,
          fontSize: 13,
          fontWeight: 700,
          mb: 0.8,
        }}
      >
        {monthLabel}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Stack spacing={0.3}>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            结余
          </Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15 }}>
            {formatNumber(monthSummary.balance)}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                color: transactionIncomeColor,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              ▲ 收入
            </Typography>
            <Typography
              sx={{
                color: transactionIncomeColor,
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              {formatNumber(monthSummary.income)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                color: transactionExpenseColor,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              ▼ 支出
            </Typography>
            <Typography
              sx={{
                color: transactionExpenseColor,
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              {formatNumber(monthSummary.expense)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
