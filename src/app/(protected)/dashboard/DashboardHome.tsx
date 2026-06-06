"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionRow } from "transactions/TransactionRow";
import type { DashboardViewData } from "types/dashboard";

const incomeColor = "#d64b4b";
const expenseColor = "#3f7f46";
const primaryPurple = "#6d4bb3";
const summaryCardBg = "#e8e0f8";

function formatNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function PeriodExpenseCard({
  label,
  expense,
  recordCount,
}: {
  label: string;
  expense: string;
  recordCount: number;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
        flex: 1,
        p: 1.8,
      }}
    >
      <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.6 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: expenseColor,
          fontSize: 20,
          fontWeight: 900,
          lineHeight: 1.2,
        }}
      >
        -{formatNumber(expense)}
      </Typography>
      {recordCount > 0 ? (
        <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.4 }}>
          共 {recordCount} 笔记录
        </Typography>
      ) : null}
    </Box>
  );
}

export function DashboardHome({ data }: { data: DashboardViewData }) {
  const {
    monthLabel,
    monthSummary,
    recentTransactions,
    todayExpense,
    weekExpense,
  } = data;

  return (
    <Stack spacing={2.5}>
      {/* Month summary card */}
      <Box
        sx={{
          bgcolor: summaryCardBg,
          borderRadius: 2,
          p: 2.5,
        }}
      >
        <Typography
          sx={{ color: primaryPurple, fontSize: 13, fontWeight: 700, mb: 0.8 }}
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
            <Typography
              sx={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15 }}
            >
              {formatNumber(monthSummary.balance)}
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <Typography
                sx={{ color: incomeColor, fontSize: 11, fontWeight: 700 }}
              >
                ▲ 收入
              </Typography>
              <Typography
                sx={{ color: incomeColor, fontSize: 17, fontWeight: 900 }}
              >
                {formatNumber(monthSummary.income)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <Typography
                sx={{ color: expenseColor, fontSize: 11, fontWeight: 700 }}
              >
                ▼ 支出
              </Typography>
              <Typography
                sx={{ color: expenseColor, fontSize: 17, fontWeight: 900 }}
              >
                {formatNumber(monthSummary.expense)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* Recent transactions */}
      <Stack spacing={0}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 900 }}>
            最近记录
          </Typography>
          <a
            href="/transactions"
            style={{
              color: primaryPurple,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            全部 ›
          </a>
        </Stack>

        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
            left: { xs: "50%", sm: "auto" },
            overflow: "hidden",
            position: { xs: "relative", sm: "static" },
            px: 1.6,
            transform: { xs: "translateX(-50%)", sm: "none" },
            width: { xs: "100vw", sm: "auto" },
          }}
        >
          {recentTransactions.length > 0 ? (
            <Stack divider={<Divider flexItem sx={{ ml: 7.2 }} />} spacing={0}>
              {recentTransactions.map((item) => (
                <TransactionRow
                  item={item}
                  key={item.id}
                  showAccount
                  showTime
                  showNote
                />
              ))}
            </Stack>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
              variant="body2"
            >
              本月还没有记账记录。
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Today / week expense */}
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
