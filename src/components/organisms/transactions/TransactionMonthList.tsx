"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionGroupList } from "transactions/TransactionGroupList";
import { TransactionSummaryBar } from "transactions-molecules/TransactionSummaryBar";
import type {
  TransactionDateGroup,
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
} from "utils/transactions";

type TransactionMonthListProps = {
  loadMoreAction?: (offset: number) => Promise<TransactionMonthPage>;
  monthView: TransactionMonthView;
  voidAction?: (formData: FormData) => void;
};

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
      const addedSummary = createTransactionAmountSummary(
        prev.summary.currency,
      );

      for (const item of newItems) {
        addTransactionAmount(addedSummary, item.type, item.amount);
      }

      map.set(group.date, {
        ...prev,
        items: [...prev.items, ...newItems],
        summary: {
          balance: String(
            Number(prev.summary.balance) + Number(addedSummary.balance),
          ),
          currency: prev.summary.currency,
          expense: String(
            Number(prev.summary.expense) + Number(addedSummary.expense),
          ),
          income: String(
            Number(prev.summary.income) + Number(addedSummary.income),
          ),
        },
      });
    } else {
      map.set(group.date, group);
    }
  }

  return [...map.values()];
}

export function TransactionMonthList({
  loadMoreAction,
  monthView,
  voidAction,
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
    ) {
      return;
    }

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
        <TransactionSummaryBar summary={monthView.summary} />
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
      <TransactionSummaryBar summary={monthView.summary} />

      <TransactionGroupList groups={groups} voidAction={voidAction} />

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
