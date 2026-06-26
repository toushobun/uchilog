"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

import { IconBadge } from "atoms/ui/IconBadge";
import { SectionCard } from "molecules/ui/SectionCard";
import { DashboardMonthSummaryCard } from "organisms/dashboard/DashboardMonthSummaryCard";
import { DashboardRecentTransactions } from "organisms/dashboard/DashboardRecentTransactions";
import { designTokens } from "theme/theme";
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

const heroLayout = {
  backgroundHeight: { xs: 238, sm: 270 },
  containerBorderRadius: { xs: 2.5, sm: 3 },
  containerPadding: { xs: 1, sm: 1.2 },
  greetingFontSize: { xs: 15, sm: 17 },
  greetingPaddingLeft: { xs: 1, sm: 1.2 },
  greetingSpacing: 1.4,
  overlayOpacity: 0.5,
  overlayWidth: "55%",
  subtitleFontSize: { xs: 12, sm: 13 },
  titleFontSize: { xs: 28, sm: 33 },
  welcomeHeight: { xs: 178, sm: 205 },
  welcomeMaxWidth: { xs: "62%", sm: "64%" },
  welcomePaddingLeft: { xs: 2.2, sm: 2.8 },
  welcomePaddingRight: { xs: 0.5, sm: 0.8 },
  welcomePaddingTop: { xs: 2.8, sm: 3.2 },
} as const;

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
      <DashboardContentFrame>
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
      </DashboardContentFrame>
    </Box>
  );
}

function DashboardContentFrame({ children }: { children: ReactNode }) {
  return (
    <SectionCard
      component="section"
      sx={{
        background: "var(--user-theme-page-bg)",
        borderRadius: heroLayout.containerBorderRadius,
        overflow: "hidden",
        px: heroLayout.containerPadding,
        py: heroLayout.containerPadding,
        position: "relative",
      }}
    >
      <DashboardHeroBackground />
      <Stack spacing={1.8} sx={{ position: "relative", zIndex: 2 }}>
        {children}
      </Stack>
    </SectionCard>
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
    <Stack spacing={0}>
      <DashboardWelcomeHero />

      <DashboardIncomeExpenseSummary
        balance={balance}
        expense={expense}
        income={income}
      />
    </Stack>
  );
}

function DashboardHeroBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        height: heroLayout.backgroundHeight,
        left: 0,
        maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
        WebkitMaskImage:
          "linear-gradient(to bottom, black 55%, transparent 100%)",
        zIndex: 0,
      }}
    >
      <Box
        data-testid="dashboard-hero-illustration"
        sx={{
          backgroundImage: "var(--user-theme-dashboard-hero-image)",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          bottom: 0,
          left: 0,
          pointerEvents: "none",
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <Box
        sx={{
          background:
            "linear-gradient(to right, var(--user-theme-card-bg), transparent)",
          bottom: 0,
          left: 0,
          opacity: heroLayout.overlayOpacity,
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: heroLayout.overlayWidth,
        }}
      />
    </Box>
  );
}

function DashboardWelcomeHero() {
  return (
    <Stack
      sx={{
        height: heroLayout.welcomeHeight,
        maxWidth: heroLayout.welcomeMaxWidth,
        pl: heroLayout.welcomePaddingLeft,
        pr: heroLayout.welcomePaddingRight,
        pt: heroLayout.welcomePaddingTop,
      }}
    >
      <Typography
        component="p"
        sx={{
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          backgroundImage: "var(--user-theme-title-gradient)",
          color: "transparent",
          fontFamily: designTokens.typography.serifFontFamily,
          fontSize: heroLayout.titleFontSize,
          fontWeight: 700,
          letterSpacing: -0.5,
          lineHeight: 1.1,
          textShadow: "none",
        }}
      >
        KuraNote
      </Typography>
      <Stack
        spacing={heroLayout.greetingSpacing}
        sx={{
          flex: 1,
          justifyContent: "center",
          pl: heroLayout.greetingPaddingLeft,
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 0.5 }}>
          <Typography
            sx={{
              color: primaryText,
              fontSize: heroLayout.greetingFontSize,
              fontWeight: 900,
              lineHeight: 1.35,
              textShadow: "0 1px 8px var(--user-theme-card-bg)",
            }}
          >
            早呀，今天也好好记录
          </Typography>
          <WbSunnyRoundedIcon
            sx={{
              color: "warning.main",
              fontSize: heroLayout.greetingFontSize,
            }}
          />
        </Box>
        <Typography
          sx={{
            color: secondaryText,
            fontSize: heroLayout.subtitleFontSize,
            fontWeight: 600,
            lineHeight: 1.45,
            textShadow: "0 1px 8px var(--user-theme-card-bg)",
          }}
        >
          每一张小票，都是生活的线索
        </Typography>
      </Stack>
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
