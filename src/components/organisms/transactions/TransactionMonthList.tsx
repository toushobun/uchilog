"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionGroupList } from "organisms/transactions/TransactionGroupList";
import { EmptyState } from "molecules/ui/EmptyState";
import type {
  TransactionGroupPage,
  TransactionGroupSummaryItem,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { formatNumber } from "utils/transactions";

import { mergeTransactionDateGroups } from "./transactionMonthListUtils";

type TransactionMonthListProps = {
  loadGroupItemsAction?: (
    groupKey: string,
    offset: number,
  ) => Promise<TransactionMonthPage>;
  loadMoreGroupsAction?: (offset: number) => Promise<TransactionGroupPage>;
  timeGroupView: TransactionTimeGroupViewData;
};

export function TransactionMonthList(props: TransactionMonthListProps) {
  return (
    <TransactionMonthListContent
      key={getTimeGroupViewResetKey(props.timeGroupView)}
      {...props}
    />
  );
}

function TransactionMonthListContent({
  loadGroupItemsAction,
  loadMoreGroupsAction,
  timeGroupView,
}: TransactionMonthListProps) {
  const [groups, setGroups] = useState(timeGroupView.groups);
  const [nextGroupOffset, setNextGroupOffset] = useState(
    timeGroupView.nextOffset,
  );
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() =>
    createInitialExpandedGroupIds(timeGroupView),
  );
  const [dateGroupsByGroupId, setDateGroupsByGroupId] = useState(
    timeGroupView.initialDateGroupsByGroupId,
  );
  const [nextItemOffsetByGroupId, setNextItemOffsetByGroupId] = useState(
    timeGroupView.initialNextItemOffsetByGroupId,
  );
  const [groupLoadError, setGroupLoadError] = useState<string | null>(null);
  const [itemLoadErrorByGroupId, setItemLoadErrorByGroupId] = useState<
    Record<string, string>
  >({});
  const [isGroupPending, startGroupTransition] = useTransition();
  const [, startItemTransition] = useTransition();
  const loadingGroupsRef = useRef(false);
  const loadingItemGroupIdsRef = useRef(new Set<string>());
  const [loadingItemGroupIds, setLoadingItemGroupIds] = useState<
    Record<string, boolean>
  >({});

  const loadGroupItems = useCallback(
    (group: TransactionGroupSummaryItem, offset: number) => {
      if (
        !loadGroupItemsAction ||
        loadingItemGroupIdsRef.current.has(group.id)
      ) {
        return;
      }

      loadingItemGroupIdsRef.current.add(group.id);
      setLoadingItemGroupIds((prev) => ({ ...prev, [group.id]: true }));
      setItemLoadErrorByGroupId((prev) => omitRecordKey(prev, group.id));

      startItemTransition(async () => {
        try {
          const page = await loadGroupItemsAction(group.key, offset);
          setDateGroupsByGroupId((prev) => ({
            ...prev,
            [group.id]:
              offset === 0
                ? page.groups
                : mergeTransactionDateGroups(prev[group.id] ?? [], page.groups),
          }));
          setNextItemOffsetByGroupId((prev) => ({
            ...prev,
            [group.id]: page.nextOffset,
          }));
        } catch {
          setItemLoadErrorByGroupId((prev) => ({
            ...prev,
            [group.id]: "分组内流水读取失败。",
          }));
        } finally {
          loadingItemGroupIdsRef.current.delete(group.id);
          setLoadingItemGroupIds((prev) => omitRecordKey(prev, group.id));
        }
      });
    },
    [loadGroupItemsAction],
  );

  const toggleGroup = useCallback(
    (group: TransactionGroupSummaryItem) => {
      const isExpanded = expandedGroupIds.has(group.id);

      if (!isExpanded && !(group.id in dateGroupsByGroupId)) {
        loadGroupItems(group, 0);
      }

      setExpandedGroupIds((prev) => {
        const next = new Set(prev);
        if (next.has(group.id)) {
          next.delete(group.id);
        } else {
          next.add(group.id);
        }
        return next;
      });
    },
    [dateGroupsByGroupId, expandedGroupIds, loadGroupItems],
  );

  const loadMoreGroups = useCallback(() => {
    if (
      nextGroupOffset === null ||
      isGroupPending ||
      loadingGroupsRef.current ||
      !loadMoreGroupsAction
    ) {
      return;
    }

    const offset = nextGroupOffset;
    loadingGroupsRef.current = true;
    setGroupLoadError(null);
    startGroupTransition(async () => {
      try {
        const page = await loadMoreGroupsAction(offset);
        setGroups((prev) => mergeTransactionGroups(prev, page.groups));
        setNextGroupOffset(page.nextOffset);
      } catch {
        setGroupLoadError("更多分组读取失败。");
      } finally {
        loadingGroupsRef.current = false;
      }
    });
  }, [isGroupPending, loadMoreGroupsAction, nextGroupOffset]);

  if (groups.length === 0) {
    return <EmptyState title="还没有记账记录。" />;
  }

  return (
    <Stack spacing={1.1}>
      <Box>
        {groups.map((group, groupIndex) => {
          const isExpanded = expandedGroupIds.has(group.id);
          const dateGroups = dateGroupsByGroupId[group.id];
          const isItemLoading = Boolean(loadingItemGroupIds[group.id]);
          const itemLoadError = itemLoadErrorByGroupId[group.id];
          const nextItemOffset = nextItemOffsetByGroupId[group.id] ?? null;
          const isLastGroup = groupIndex === groups.length - 1;

          return (
            <Box
              key={group.id}
              sx={{
                borderBottom: isLastGroup
                  ? "none"
                  : "1px solid var(--user-theme-card-border)",
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                onClick={() => toggleGroup(group)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleGroup(group);
                  }
                }}
                sx={{
                  cursor: "pointer",
                  minHeight: 72,
                  outline: "none",
                  px: 0.4,
                  py: 2,
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:focus-visible": {
                    outline: "2px solid var(--user-theme-action-text)",
                    outlineOffset: "-2px",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.9}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <Typography
                    noWrap
                    sx={{
                      color: "var(--user-theme-balance-text)",
                      flex: 1,
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: 0,
                    }}
                  >
                    {group.label}
                  </Typography>

                  <Stack
                    spacing={0.9}
                    sx={{
                      alignItems: "flex-end",
                      flexShrink: 0,
                      justifyContent: "center",
                    }}
                  >
                    <SummaryLine
                      label="结余"
                      labelColor="text.secondary"
                      labelFontWeight={400}
                      value={formatSignedYen(group.summary.balance)}
                    />
                    <Stack direction="row" spacing={0.8} sx={{ minWidth: 0 }}>
                      <SummaryLine
                        label="收入"
                        labelColor="var(--user-theme-income-amount)"
                        value={formatUnsignedYen(group.summary.income)}
                      />
                      <SummaryLine
                        label="支出"
                        labelColor="var(--user-theme-negative-amount)"
                        value={formatUnsignedYen(group.summary.expense)}
                      />
                    </Stack>
                  </Stack>

                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      color: "text.secondary",
                      flexShrink: 0,
                      fontSize: 20,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 160ms ease",
                    }}
                  />
                </Stack>
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack
                  spacing={1.4}
                  sx={{
                    borderTop: "1px solid var(--user-theme-card-border)",
                    px: 0.75,
                    py: 1.2,
                  }}
                >
                  {dateGroups ? (
                    dateGroups.length > 0 ? (
                      <TransactionGroupList
                        groups={dateGroups}
                        showSummary={false}
                      />
                    ) : (
                      <EmptyState title="这个分组下还没有流水。" />
                    )
                  ) : null}

                  {isItemLoading && !dateGroups ? <GroupItemsSkeleton /> : null}

                  <LoadMoreOnVisible
                    enabled={
                      Boolean(dateGroups) &&
                      nextItemOffset !== null &&
                      !itemLoadError
                    }
                    isLoading={isItemLoading}
                    onVisible={() => {
                      if (nextItemOffset !== null) {
                        loadGroupItems(group, nextItemOffset);
                      }
                    }}
                  />

                  {itemLoadError ? (
                    <InlineLoadError
                      message={itemLoadError}
                      onRetry={() => loadGroupItems(group, nextItemOffset ?? 0)}
                    />
                  ) : null}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <LoadMoreOnVisible
        enabled={nextGroupOffset !== null && !groupLoadError}
        isLoading={isGroupPending}
        onVisible={loadMoreGroups}
      />

      {groupLoadError ? (
        <InlineLoadError message={groupLoadError} onRetry={loadMoreGroups} />
      ) : null}
    </Stack>
  );
}

function SummaryLine({
  label,
  labelColor = "text.primary",
  labelFontWeight = 700,
  value,
}: {
  label: string;
  labelColor?: string;
  labelFontWeight?: number;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={0.6} sx={{ alignItems: "baseline" }}>
      <Typography
        sx={{
          color: labelColor,
          fontSize: 11,
          fontWeight: labelFontWeight,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: "text.primary",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function InlineLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        px: 1,
        py: 1.2,
      }}
    >
      <Typography color="error" sx={{ fontSize: 12, fontWeight: 800 }}>
        {message}
      </Typography>
      <Button
        onClick={onRetry}
        size="small"
        sx={{
          borderRadius: 999,
          color: "var(--user-theme-action-text)",
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        重试
      </Button>
    </Stack>
  );
}

function LoadMoreOnVisible({
  enabled,
  isLoading,
  onVisible,
}: {
  enabled: boolean;
  isLoading: boolean;
  onVisible: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!enabled || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onVisibleRef.current();
      },
      { rootMargin: "0px 0px 75% 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <Stack
      ref={sentinelRef}
      sx={{ alignItems: "center", minHeight: 40, py: 1 }}
    >
      {isLoading ? <CircularProgress size={22} /> : null}
    </Stack>
  );
}

function GroupItemsSkeleton() {
  return (
    <Stack spacing={1.2} sx={{ px: 0.4 }}>
      {[0, 1].map((index) => (
        <Box
          key={index}
          sx={{
            bgcolor: "var(--user-theme-receipt-bg)",
            borderRadius: 2,
            height: 82,
            opacity: 0.72,
          }}
        />
      ))}
    </Stack>
  );
}

function createInitialExpandedGroupIds(
  timeGroupView: TransactionTimeGroupViewData,
) {
  return timeGroupView.initialExpandedGroupId
    ? new Set([timeGroupView.initialExpandedGroupId])
    : new Set<string>();
}

function getTimeGroupViewResetKey(timeGroupView: TransactionTimeGroupViewData) {
  return [
    timeGroupView.groupBy,
    timeGroupView.initialExpandedGroupId ?? "none",
    timeGroupView.groups.map((group) => group.id).join("|"),
  ].join(":");
}

function mergeTransactionGroups(
  existing: TransactionGroupSummaryItem[],
  incoming: TransactionGroupSummaryItem[],
) {
  const existingIds = new Set(existing.map((group) => group.id));
  return [
    ...existing,
    ...incoming.filter((group) => !existingIds.has(group.id)),
  ];
}

function omitRecordKey<T>(record: Record<string, T>, key: string) {
  return Object.fromEntries(
    Object.entries(record).filter(([recordKey]) => recordKey !== key),
  );
}

// TODO: 暂时以日元固定显示 ¥，后续需根据 summary.currency 字段使用 formatAmount
function formatUnsignedYen(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return `¥${formatNumber(amount)}`;

  return `¥${formatNumber(String(Math.abs(value)))}`;
}

function formatSignedYen(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return `¥${formatNumber(amount)}`;
  if (value === 0) return "¥0";

  const sign = value < 0 ? "-" : "";
  return `${sign}¥${formatNumber(String(Math.abs(value)))}`;
}
