"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionListRow } from "transactions/TransactionListRow";
import type { TransactionListPage } from "types/transactions";

type TransactionListProps = {
  initialPage: TransactionListPage;
  loadMoreAction: (offset: number) => Promise<TransactionListPage>;
  voidAction?: (formData: FormData) => void;
};

export function TransactionList({
  initialPage,
  loadMoreAction,
  voidAction,
}: TransactionListProps) {
  const [prevInitialPage, setPrevInitialPage] = useState(initialPage);
  const [items, setItems] = useState(initialPage.items);
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  if (prevInitialPage !== initialPage) {
    setPrevInitialPage(initialPage);
    setItems(initialPage.items);
    setNextOffset(initialPage.nextOffset);
    setErrorMessage(null);
  }

  const loadNextPage = useCallback(() => {
    if (nextOffset === null || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const page = await loadMoreAction(nextOffset);
        setItems((currentItems) => [...currentItems, ...page.items]);
        setNextOffset(page.nextOffset);
        setErrorMessage(null);
      } catch {
        setErrorMessage("追加读取失败。请稍后重试。");
      }
    });
  }, [isPending, loadMoreAction, nextOffset]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || nextOffset === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadNextPage, nextOffset]);

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4 }}>
        还没有记账记录。
      </Typography>
    );
  }

  return (
    <Stack sx={{ mt: 4 }}>
      <Stack divider={<Divider flexItem />} spacing={0}>
        {items.map((item) => (
          <TransactionListRow
            item={item}
            key={item.id}
            voidAction={voidAction}
          />
        ))}
      </Stack>

      {errorMessage ? (
        <Stack spacing={1} sx={{ alignItems: "center", mt: 3 }}>
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
          {nextOffset !== null ? (
            <Button
              disabled={isPending}
              onClick={loadNextPage}
              size="small"
              variant="outlined"
            >
              重新读取
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {nextOffset !== null ? (
        <Stack
          ref={sentinelRef}
          sx={{ alignItems: "center", minHeight: 56, py: 2 }}
        >
          {isPending ? <CircularProgress size={24} /> : null}
        </Stack>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
          variant="body2"
        >
          已显示全部记录。
        </Typography>
      )}
    </Stack>
  );
}
