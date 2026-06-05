"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionDateTime } from "transactions/TransactionDateTime";
import type {
  TransactionListItem,
  TransactionListPage,
} from "transactions-route/types";

type TransactionListProps = {
  initialPage: TransactionListPage;
  loadMoreAction: (offset: number) => Promise<TransactionListPage>;
  voidAction?: (formData: FormData) => void;
};

function formatAmount(amount: string, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return currency ? `${amount} ${currency}` : amount;
  }

  const formattedAmount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function getMerchantInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "商";
}

function TransactionListRow({
  item,
  voidAction,
}: {
  item: TransactionListItem;
  voidAction?: (formData: FormData) => void;
}) {
  return (
    <Stack spacing={1.2} sx={{ py: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={0.8}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip
              color={item.type === "expense" ? "default" : "success"}
              label={item.type === "expense" ? "支出" : "收入"}
              size="small"
            />
            {item.category_name ? (
              <Chip label={item.category_name} size="small" />
            ) : null}
            {item.merchant_name ? (
              <Chip
                avatar={
                  <Avatar
                    alt={item.merchant_name}
                    src={item.merchant_icon_url ?? undefined}
                  >
                    {getMerchantInitial(item.merchant_name)}
                  </Avatar>
                }
                label={item.merchant_name}
                size="small"
              />
            ) : null}
          </Stack>

          <Typography color="text.secondary" variant="body2">
            <TransactionDateTime value={item.transaction_at} />
          </Typography>

          <Typography color="text.secondary" variant="body2">
            账户：{item.account_name}
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}
        >
          <Typography component="p" sx={{ fontWeight: 700 }} variant="h6">
            {`${item.type === "expense" ? "-" : "+"}${formatAmount(
              item.amount,
              item.account_currency,
            )}`}
          </Typography>

          {voidAction ? (
            <form
              action={voidAction}
              onSubmit={(event) => {
                if (!window.confirm("确定要撤销这条记录吗？")) {
                  event.preventDefault();
                }
              }}
            >
              <input name="transactionRecordId" type="hidden" value={item.id} />
              <Button color="error" size="small" type="submit" variant="text">
                撤销
              </Button>
            </form>
          ) : null}
        </Stack>
      </Stack>

      {item.note ? (
        <Typography color="text.secondary" variant="body2">
          {item.note}
        </Typography>
      ) : null}
    </Stack>
  );
}

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
