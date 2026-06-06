"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionRow } from "transactions/TransactionRow";
import type {
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";

type TransactionMonthListProps = {
  monthView: TransactionMonthView;
  voidAction?: (formData: FormData) => void;
  loadMoreAction?: (offset: number) => Promise<TransactionMonthPage>;
};

const incomeColor = "#d64b4b";
const expenseColor = "#3f7f46";
const borderPurple = "#e5dcf6";

function formatNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatSignedNumber(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  const abs = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(value));

  return value >= 0 ? `+${abs}` : `-${abs}`;
}

function createEmptySummary(currency: string): TransactionAmountSummary {
  return {
    balance: "0",
    currency,
    expense: "0",
    income: "0",
  };
}

function addItemAmount(
  summary: TransactionAmountSummary,
  type: "expense" | "income",
  amount: string,
) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return;

  if (type === "income") {
    summary.income = String(Number(summary.income) + value);
    summary.balance = String(Number(summary.balance) + value);
    return;
  }

  summary.expense = String(Number(summary.expense) + value);
  summary.balance = String(Number(summary.balance) - value);
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Stack spacing={0.4} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography
        sx={{
          color: color ?? "text.primary",
          fontSize: 16,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function MonthSummary({ summary }: { summary: TransactionAmountSummary }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${borderPurple}`,
        borderRadius: 1,
        boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
        mt: 1.5,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        divider={<Divider flexItem orientation="vertical" />}
        sx={{ px: 2, py: 1.5 }}
      >
        <SummaryItem
          color={incomeColor}
          label="收入"
          value={formatNumber(summary.income)}
        />
        <SummaryItem
          color={expenseColor}
          label="支出"
          value={formatNumber(summary.expense)}
        />
        <SummaryItem label="结余" value={formatNumber(summary.balance)} />
      </Stack>
    </Box>
  );
}

function mergeGroups(
  existing: TransactionDateGroup[],
  incoming: TransactionDateGroup[],
): TransactionDateGroup[] {
  const map = new Map(existing.map((g) => [g.date, g]));

  for (const group of incoming) {
    const prev = map.get(group.date);

    if (prev) {
      const existingItemIds = new Set(prev.items.map((item) => item.id));
      const newItems = group.items.filter(
        (item) => !existingItemIds.has(item.id),
      );
      const addedSummary = createEmptySummary(prev.summary.currency);

      for (const item of newItems) {
        addItemAmount(addedSummary, item.type, item.amount);
      }

      map.set(group.date, {
        ...prev,
        items: [...prev.items, ...newItems],
        summary: {
          currency: prev.summary.currency,
          income: String(
            Number(prev.summary.income) + Number(addedSummary.income),
          ),
          expense: String(
            Number(prev.summary.expense) + Number(addedSummary.expense),
          ),
          balance: String(
            Number(prev.summary.balance) + Number(addedSummary.balance),
          ),
        },
      });
    } else {
      map.set(group.date, group);
    }
  }

  return [...map.values()];
}

function GroupList({
  groups,
  voidAction,
}: {
  groups: TransactionDateGroup[];
  voidAction?: (formData: FormData) => void;
}) {
  return (
    <Stack
      sx={{
        left: { xs: "50%", sm: "auto" },
        overflow: "hidden",
        position: { xs: "relative", sm: "static" },
        transform: { xs: "translateX(-50%)", sm: "none" },
        width: { xs: "100vw", sm: "auto" },
      }}
    >
      {groups.map((group) => (
        <Box key={group.date}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.6,
              py: 0.8,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ fontSize: 13, fontWeight: 800 }}
            >
              {group.label}
            </Typography>
            <Typography
              sx={{
                color:
                  Number(group.summary.balance) >= 0
                    ? incomeColor
                    : expenseColor,
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {formatSignedNumber(group.summary.balance)}
            </Typography>
          </Stack>

          <Stack
            divider={<Divider flexItem sx={{ ml: 7.2 }} />}
            sx={{
              bgcolor: "background.paper",
              boxShadow: "0 10px 24px rgba(77, 55, 120, 0.05)",
              overflow: "hidden",
              px: 1.6,
            }}
          >
            {group.items.map((item) => (
              <TransactionRow
                item={item}
                key={item.id}
                showAccount
                showTime
                showNote
                showRecorder
                voidAction={voidAction}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export function TransactionMonthList({
  monthView,
  voidAction,
  loadMoreAction,
}: TransactionMonthListProps) {
  const [prevMonthView, setPrevMonthView] = useState(monthView);
  const [groups, setGroups] = useState(monthView.groups);
  const [nextOffset, setNextOffset] = useState(monthView.nextOffset);
  const [isPending, startTransition] = useTransition();
  const isLoadingRef = useRef(false);
  const loadMoreRef = useRef<() => void>(() => {});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  if (prevMonthView !== monthView) {
    setPrevMonthView(monthView);
    setGroups(monthView.groups);
    setNextOffset(monthView.nextOffset);
  }

  useEffect(() => {
    isLoadingRef.current = false;
  }, [monthView]);

  const loadMore = useCallback(() => {
    if (
      nextOffset === null ||
      isPending ||
      isLoadingRef.current ||
      !loadMoreAction
    )
      return;

    isLoadingRef.current = true;
    startTransition(async () => {
      try {
        const page = await loadMoreAction(nextOffset);
        setGroups((prev) => mergeGroups(prev, page.groups));
        setNextOffset(page.nextOffset);
      } finally {
        isLoadingRef.current = false;
      }
    });
  }, [isPending, loadMoreAction, nextOffset]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || nextOffset === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "0px 0px 75% 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [nextOffset]);

  if (groups.length === 0) {
    return (
      <Stack spacing={2.5} sx={{ mt: 1.5 }}>
        <MonthSummary summary={monthView.summary} />
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            px: 2,
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">这个月还没有记账记录。</Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 1.5 }}>
      <MonthSummary summary={monthView.summary} />

      <GroupList groups={groups} voidAction={voidAction} />

      {nextOffset !== null ? (
        <Stack ref={sentinelRef} sx={{ alignItems: "center", py: 2 }}>
          {isPending ? <CircularProgress size={24} /> : null}
        </Stack>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ pb: 2, textAlign: "center" }}
          variant="caption"
        >
          已显示全部记录
        </Typography>
      )}
    </Stack>
  );
}
