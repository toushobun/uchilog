"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

import { IconBadge } from "atoms/ui/IconBadge";
import { SectionCard } from "molecules/ui/SectionCard";
import { DashboardMonthSummaryCard } from "organisms/dashboard/DashboardMonthSummaryCard";
import { DashboardRecentTransactions } from "organisms/dashboard/DashboardRecentTransactions";
import type { DashboardViewData } from "types/dashboard";
import { formatNumber } from "utils/transactions";

const incomeColor = "var(--user-theme-income-amount)";
const expenseColor = "var(--user-theme-negative-amount)";
const balanceColor = "var(--user-theme-stat-value-1)";
const primaryText = "var(--user-theme-balance-text)";
const secondaryText = "var(--user-theme-secondary-text)";
const actionText = "var(--user-theme-action-text)";
const inactiveActionText = "var(--user-theme-bottom-nav-inactive)";
const activeIconBackground = "var(--user-theme-bottom-nav-active-bg)";
const inactiveIconBackground = "var(--user-theme-segment-bg)";

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
        bgcolor: "background.default",
        boxShadow: (theme) =>
          `0 0 0 100vmax ${theme.palette.background.default}`,
        clipPath: "inset(0 -100vmax)",
        color: "text.primary",
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
      <Typography sx={{ color: primaryText, fontSize: 15, fontWeight: 800 }}>
        早呀，今天也好好记录 🌼
      </Typography>
      <Typography sx={{ color: secondaryText, fontSize: 12 }}>
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
    <SectionCard
      sx={{
        borderRadius: 1.25,
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
    </SectionCard>
  );
}

function DashboardQuickActions() {
  const actions: QuickAction[] = [
    {
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
          <SectionCard
            sx={{
              borderRadius: 1.25,
              color: isActive ? actionText : inactiveActionText,
              minHeight: 68,
              px: 0.7,
              py: 1,
              textAlign: "center",
            }}
          >
            <Stack spacing={0.7} sx={{ alignItems: "center" }}>
              <IconBadge
                size="sm"
                sx={{
                  backgroundColor: isActive
                    ? activeIconBackground
                    : inactiveIconBackground,
                  borderRadius: 1,
                  color: isActive ? actionText : secondaryText,
                  height: 28,
                  width: 28,
                }}
              >
                {action.icon}
              </IconBadge>
              <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
                {action.label}
              </Typography>
            </Stack>
          </SectionCard>
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
