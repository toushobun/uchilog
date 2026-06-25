import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

import { statisticsMonthHref } from "config/paths";
import { MonthNavButton } from "molecules/navigation/MonthNavButton";
import { EmptyState } from "molecules/ui/EmptyState";
import { SectionCard } from "molecules/ui/SectionCard";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";
import type { StatisticsRankItem, StatisticsViewData } from "types/statistics";
import { formatPlainAmount } from "utils/transactions";

type StatisticsTemplateProps = StatisticsViewData;

export function StatisticsTemplate({
  categoryExpenseRanking,
  ledgerName,
  merchantExpenseRanking,
  monthLabel,
  nextMonth,
  previousMonth,
  summary,
}: StatisticsTemplateProps) {
  const hasRankingData =
    merchantExpenseRanking.length > 0 || categoryExpenseRanking.length > 0;
  const totalExpense = Number(summary.expense);

  return (
    <Box sx={statisticsPageSx}>
      <PageShell>
        <Stack spacing={2}>
          <PageHeader
            title="统计"
            subtitle={
              <Stack spacing={0.5}>
                <span>当前账本：{ledgerName}</span>
                <Typography color="text.secondary" variant="body2">
                  按月份整理收支、分类和商家，让家庭账本一眼看清。
                </Typography>
              </Stack>
            }
          />

          <SectionCard sx={summarySectionSx}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <MonthNavButton href={statisticsMonthHref(previousMonth)}>
                ‹ 上个月
              </MonthNavButton>
              <Stack spacing={0.2} sx={{ alignItems: "center", minWidth: 0 }}>
                <Typography
                  component="p"
                  sx={{ fontWeight: 900, lineHeight: 1.2 }}
                  variant="h6"
                >
                  {monthLabel}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  月度收支概览
                </Typography>
              </Stack>
              <MonthNavButton href={statisticsMonthHref(nextMonth)}>
                下个月 ›
              </MonthNavButton>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <SummaryCard
                amount={formatPlainAmount(summary.income, summary.currency)}
                label="本月收入"
                tone="income"
              />
              <SummaryCard
                amount={formatPlainAmount(summary.expense, summary.currency)}
                label="本月支出"
                tone="expense"
              />
              <SummaryCard
                amount={formatPlainAmount(summary.balance, summary.currency)}
                label="本月净收支"
                tone="balance"
              />
            </Stack>
          </SectionCard>

          {hasRankingData ? (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <RankingSection
                currency={summary.currency}
                emptyDescription="这个月还没有分类支出记录。"
                items={categoryExpenseRanking}
                title="分类支出汇总"
                totalExpense={totalExpense}
              />
              <RankingSection
                currency={summary.currency}
                emptyDescription="这个月还没有支出记录。"
                items={merchantExpenseRanking}
                title="商家支出排行"
                totalExpense={totalExpense}
              />
            </Stack>
          ) : (
            <EmptyState
              description="这个月还没有可以统计的收入或支出。"
              title="暂无统计数据"
            />
          )}
        </Stack>
      </PageShell>
    </Box>
  );
}

function SummaryCard({
  amount,
  label,
  tone,
}: {
  amount: string;
  label: string;
  tone: "balance" | "expense" | "income";
}) {
  return (
    <Stack sx={summaryCardSx}>
      <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{
          color: summaryAmountColorMap[tone],
          fontWeight: 900,
          mt: 0.7,
          overflowWrap: "anywhere",
        }}
        variant="h6"
      >
        {amount}
      </Typography>
    </Stack>
  );
}

function RankingSection({
  currency,
  emptyDescription,
  items,
  title,
  totalExpense,
}: {
  currency: string;
  emptyDescription: string;
  items: StatisticsRankItem[];
  title: string;
  totalExpense: number;
}) {
  return (
    <SectionCard sx={rankingSectionSx}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography component="h2" variant="h6" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
        <Typography sx={rankingCountSx} variant="caption">
          {items.length} 项
        </Typography>
      </Stack>

      {items.length > 0 ? (
        <Stack spacing={0} sx={{ mt: 1.5 }}>
          {items.map((item, index) => (
            <RankingRow
              currency={currency}
              item={item}
              key={item.id}
              rank={index + 1}
              totalExpense={totalExpense}
            />
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {emptyDescription}
        </Typography>
      )}
    </SectionCard>
  );
}

function RankingRow({
  currency,
  item,
  rank,
  totalExpense,
}: {
  currency: string;
  item: StatisticsRankItem;
  rank: number;
  totalExpense: number;
}) {
  const percentage = calculatePercentage(item.amount, totalExpense);

  return (
    <Stack spacing={1} sx={rankingRowSx}>
      <Stack
        direction="row"
        spacing={1.2}
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.1} sx={{ minWidth: 0 }}>
          <Box aria-hidden sx={rankBadgeSx}>
            {rank}
          </Box>
          <Stack spacing={0.4} sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800 }}>
              {item.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {item.transactionCount} 笔 · 占比 {percentage}%
            </Typography>
          </Stack>
        </Stack>
        <Typography sx={{ flexShrink: 0, fontWeight: 900, textAlign: "right" }}>
          {formatPlainAmount(item.amount, currency)}
        </Typography>
      </Stack>
      <ProgressBar label={`${item.name}支出占比`} value={percentage} />
    </Stack>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <Box
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      role="progressbar"
      sx={progressTrackSx}
    >
      <Box
        sx={{
          backgroundColor: "var(--user-theme-budget-bar-1)",
          borderRadius: 999,
          height: "100%",
          width: `${value}%`,
        }}
      />
    </Box>
  );
}

function calculatePercentage(amount: string, totalExpense: number) {
  const value = Number(amount);

  if (!Number.isFinite(value) || totalExpense <= 0) return 0;

  return Math.min(100, Math.round((value / totalExpense) * 100));
}

const statisticsPageSx: SxProps<Theme> = {
  bgcolor: "background.default",
  color: "text.primary",
  minHeight: "100dvh",
};

const summarySectionSx = {
  borderRadius: 2,
  p: { xs: 2, sm: 2.5 },
};

const summaryCardSx = {
  backgroundColor: "var(--user-theme-tx-summary-bg)",
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: 1.5,
  flex: 1,
  minWidth: 0,
  p: 1.5,
};

const summaryAmountColorMap = {
  balance: "var(--user-theme-balance-text)",
  expense: "var(--user-theme-negative-amount)",
  income: "var(--user-theme-income-amount)",
} as const;

const rankingSectionSx = {
  borderRadius: 2,
  flex: 1,
  p: { xs: 2, sm: 2.5 },
};

const rankingCountSx = {
  backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
  borderRadius: 999,
  color: "var(--user-theme-action-text)",
  fontWeight: 800,
  px: 1,
  py: 0.25,
};

const rankingRowSx = {
  borderTop: "1px solid var(--user-theme-card-border)",
  py: 1.5,
  "&:first-of-type": {
    borderTop: 0,
    pt: 0,
  },
  "&:last-of-type": {
    pb: 0,
  },
};

const rankBadgeSx = {
  alignItems: "center",
  backgroundColor: "var(--user-theme-icon-badge-bg)",
  borderRadius: 1,
  color: "var(--user-theme-icon-badge-color)",
  display: "inline-flex",
  flexShrink: 0,
  fontSize: 12,
  fontWeight: 900,
  height: 26,
  justifyContent: "center",
  mt: 0.1,
  width: 26,
};

const progressTrackSx = {
  backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
  borderRadius: 999,
  height: 8,
  overflow: "hidden",
};
