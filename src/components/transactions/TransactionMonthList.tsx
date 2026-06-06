"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type {
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionListItem,
  TransactionMonthPage,
  TransactionMonthView,
} from "transactions-route/types";

type TransactionMonthListProps = {
  monthView: TransactionMonthView;
  voidAction?: (formData: FormData) => void;
  loadMoreAction?: (offset: number) => Promise<TransactionMonthPage>;
};

const incomeColor = "#d64b4b";
const expenseColor = "#3f7f46";
const primaryPurple = "#6d4bb3";
const avatarBackground = "#f4efff";
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

function formatRowAmount(type: "expense" | "income", amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return amount;

  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

  return `${type === "expense" ? "-" : "+"}${formatted}`;
}

function getMerchantInitial(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || "记";
}

function getAmountColor(type: "expense" | "income") {
  return type === "income" ? incomeColor : expenseColor;
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

function TransactionRow({
  item,
  voidAction,
}: {
  item: TransactionListItem;
  voidAction?: (formData: FormData) => void;
}) {
  const merchantName = item.merchant_name ?? "未指定商家";
  const amountColor = getAmountColor(item.type);
  const time = new Date(item.transaction_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.4 }}>
      <Avatar
        alt={merchantName}
        src={item.merchant_icon_url ?? undefined}
        sx={{
          bgcolor: avatarBackground,
          color: primaryPurple,
          fontSize: 18,
          fontWeight: 800,
          flexShrink: 0,
          height: 42,
          width: 42,
        }}
      >
        {getMerchantInitial(item.merchant_name)}
      </Avatar>

      <Stack spacing={0.3} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}
        >
          {merchantName}
        </Typography>
        <Typography noWrap sx={{ fontSize: 11, lineHeight: 1.4 }}>
          {item.category_name ?? "未分类"}
        </Typography>
        <Typography
          noWrap
          sx={{ fontSize: 11, lineHeight: 1.4, opacity: 0.45 }}
        >
          {item.account_name} · {time}
        </Typography>
        {item.note ? (
          <Typography
            noWrap
            sx={{ fontSize: 11, lineHeight: 1.4, opacity: 0.55 }}
          >
            {item.note}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={0.2} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
        <Typography
          sx={{
            color: amountColor,
            fontSize: 15,
            fontWeight: 900,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {formatRowAmount(item.type, item.amount)}
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
            <Button
              color="error"
              size="small"
              sx={{ minWidth: 0, px: 0.5, py: 0, typography: "caption" }}
              type="submit"
              variant="text"
            >
              撤销
            </Button>
          </form>
        ) : null}
      </Stack>
    </Stack>
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
