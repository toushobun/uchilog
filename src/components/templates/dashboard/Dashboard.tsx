"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

import { routePaths } from "config/paths";
import {
  receiptAccentColor,
  receiptCardBorder,
  receiptExpenseColor,
  receiptIncomeColor,
  receiptPageBackground,
  receiptTextColor,
} from "theme/receiptColors";
import { DashboardMonthSummaryCard } from "organisms/dashboard/DashboardMonthSummaryCard";
import { DashboardRecentTransactions } from "organisms/dashboard/DashboardRecentTransactions";
import type { DashboardViewData } from "types/dashboard";
import { formatNumber } from "utils/transactions";

const homeBackground = receiptPageBackground;
const homeCardBorder = receiptCardBorder;
const homeText = receiptTextColor;
const incomeColor = receiptIncomeColor;
const expenseColor = receiptExpenseColor;
const balanceColor = "#8b5e34";

type QuickAction = {
  href?: string;
  icon: ReactNode;
  id: string;
  label: string;
};

export function DashboardTemplate({ data }: { data: DashboardViewData }) {
  const { accountSummaries, monthLabel, monthSummary, recentTransactions } =
    data;

  return (
    <Box
      sx={{
        bgcolor: homeBackground,
        boxShadow: `0 0 0 100vmax ${homeBackground}`,
        clipPath: "inset(0 -100vmax)",
        color: homeText,
        minHeight: "100dvh",
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 3 },
        py: { xs: 2.5, sm: 3 },
      }}
    >
      <Stack spacing={1.8}>
        <DashboardHeroPanel
          balance={monthSummary.balance}
          expense={monthSummary.expense}
          income={monthSummary.income}
        />

        <DashboardMonthSummaryCard
          accounts={accountSummaries}
          monthLabel={monthLabel}
        />

        <DashboardQuickActions />

        <DashboardRecentTransactions transactions={recentTransactions} />
      </Stack>
    </Box>
  );
}

function DashboardHeroPanel({
  balance,
  expense,
  income,
}: {
  balance: string;
  expense: string;
  income: string;
}) {
  return (
    <Stack spacing={1.2}>
      <DashboardGreetingPanel />

      <DashboardIncomeExpenseSummary
        balance={balance}
        expense={expense}
        income={income}
      />
    </Stack>
  );
}

function DashboardGreetingPanel() {
  return (
    <Stack spacing={0.6}>
      <Typography
        component="p"
        sx={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}
      >
        KuraNote
      </Typography>
      <Typography sx={{ color: homeText, fontSize: 15, fontWeight: 800 }}>
        早呀，今天也好好记录 🌼
      </Typography>
      <Typography sx={{ color: "rgba(74, 47, 27, 0.58)", fontSize: 12 }}>
        每一张小票，都是生活的脚本
      </Typography>
    </Stack>
  );
}

function DashboardIncomeExpenseSummary({
  balance,
  expense,
  income,
}: {
  balance: string;
  expense: string;
  income: string;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 0.7,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      }}
    >
      <DashboardSummaryPill
        color={incomeColor}
        label="本月收入"
        value={income}
      />
      <DashboardSummaryPill
        color={expenseColor}
        label="本月支出"
        value={expense}
      />
      <DashboardSummaryPill
        color={balanceColor}
        label="本月结余"
        value={balance}
      />
    </Box>
  );
}

function DashboardSummaryPill({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.86)",
        border: `1px solid ${homeCardBorder}`,
        borderRadius: 1.25,
        boxShadow: "0 6px 14px rgba(120, 53, 15, 0.04)",
        minWidth: 0,
        px: { xs: 0.8, sm: 1.2 },
        py: 1.05,
        textAlign: "center",
      }}
    >
      <Typography sx={{ color, fontSize: 11, fontWeight: 900, mb: 0.3 }}>
        {label}
      </Typography>
      <Typography
        noWrap
        sx={{ color, fontSize: { xs: 14, sm: 18 }, fontWeight: 900 }}
      >
        {/* TODO: 暂时以日元固定显示，后续需根据 currency 字段使用 formatAmount */}
        ¥ {formatNumber(value)}
      </Typography>
    </Box>
  );
}

function DashboardQuickActions() {
  const actions: QuickAction[] = [
    {
      // href: routePaths.transactionsNew,
      icon: <ReceiptLongRoundedIcon fontSize="small" />,
      id: "quick-entry",
      label: "快速记账",
    },
    {
      icon: <CameraAltRoundedIcon fontSize="small" />,
      id: "photo-entry",
      label: "拍照记账",
    },
    {
      icon: <AddRoundedIcon fontSize="small" />,
      id: "coming-soon-1",
      label: "敬请期待",
    },
    {
      icon: <AddRoundedIcon fontSize="small" />,
      id: "coming-soon-2",
      label: "敬请期待",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 0.75,
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      }}
    >
      {actions.map((action) => {
        const isActive = Boolean(action.href);
        const content = (
          <Stack
            spacing={0.7}
            sx={{
              alignItems: "center",
              bgcolor: "rgba(255, 255, 255, 0.74)",
              border: `1px solid ${homeCardBorder}`,
              borderRadius: 1.25,
              color: isActive ? receiptAccentColor : "rgba(74, 47, 27, 0.45)",
              minHeight: 68,
              px: 0.7,
              py: 1,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                bgcolor: isActive
                  ? "rgba(254, 243, 199, 0.9)"
                  : "rgba(244, 229, 210, 0.72)",
                borderRadius: 1,
                display: "inline-flex",
                height: 28,
                justifyContent: "center",
                width: 28,
              }}
            >
              {action.icon}
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
              {action.label}
            </Typography>
          </Stack>
        );

        return action.href ? (
          <Box
            component={Link}
            href={action.href}
            key={action.id}
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            {content}
          </Box>
        ) : (
          <Box key={action.id}>{content}</Box>
        );
      })}
    </Box>
  );
}
