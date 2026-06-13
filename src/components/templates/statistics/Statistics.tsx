import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
    <PageShell>
      <PageHeader title="统计" subtitle={`当前账本：${ledgerName}`} />

      <SectionCard>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <MonthNavButton href={statisticsMonthHref(previousMonth)}>
            ‹ 上个月
          </MonthNavButton>
          <Typography sx={{ fontWeight: 800 }}>{monthLabel}</Typography>
          <MonthNavButton href={statisticsMonthHref(nextMonth)}>
            下个月 ›
          </MonthNavButton>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <SummaryCard
            amount={formatPlainAmount(summary.income, summary.currency)}
            label="本月收入"
          />
          <SummaryCard
            amount={formatPlainAmount(summary.expense, summary.currency)}
            label="本月支出"
          />
          <SummaryCard
            amount={formatPlainAmount(summary.balance, summary.currency)}
            label="本月净收支"
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
    </PageShell>
  );
}

function SummaryCard({ amount, label }: { amount: string; label: string }) {
  return (
    <Stack sx={{ flex: 1 }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography component="p" variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
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
    <SectionCard sx={{ flex: 1 }}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>

      {items.length > 0 ? (
        <Stack spacing={1.8} sx={{ mt: 2 }}>
          {items.map((item) => (
            <RankingRow
              currency={currency}
              item={item}
              key={item.id}
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
  totalExpense,
}: {
  currency: string;
  item: StatisticsRankItem;
  totalExpense: number;
}) {
  const percentage = calculatePercentage(item.amount, totalExpense);

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between" }}
      >
        <Stack spacing={0.4} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
          <Typography color="text.secondary" variant="body2">
            {item.transactionCount} 笔 · 占比 {percentage}%
          </Typography>
        </Stack>
        <Typography sx={{ flexShrink: 0, fontWeight: 800 }}>
          {formatPlainAmount(item.amount, currency)}
        </Typography>
      </Stack>
      <ProgressBar label={`${item.name}支出占比`} value={percentage} />
    </Stack>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      role="progressbar"
      style={{
        background: "var(--user-theme-bottom-nav-active-bg)",
        borderRadius: 999,
        height: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "var(--user-theme-budget-bar-1)",
          borderRadius: 999,
          height: "100%",
          width: `${value}%`,
        }}
      />
    </div>
  );
}

function calculatePercentage(amount: string, totalExpense: number) {
  const value = Number(amount);

  if (!Number.isFinite(value) || totalExpense <= 0) return 0;

  return Math.min(100, Math.round((value / totalExpense) * 100));
}
