"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionGroupList } from "organisms/transactions/TransactionGroupList";
import { EmptyState } from "molecules/ui/EmptyState";
import type { ServerAction } from "types/actions";
import type {
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";

import { mergeTransactionDateGroups } from "./transactionMonthListUtils";

type TransactionMonthListProps = {
  loadMoreAction?: (offset: number) => Promise<TransactionMonthPage>;
  monthView: TransactionMonthView;
  voidAction?: ServerAction;
};

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
        setGroups((prev) => mergeTransactionDateGroups(prev, page.groups));
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
    return <EmptyState title="这个月还没有记账记录。" />;
  }

  return (
    <Stack spacing={2.3}>
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
