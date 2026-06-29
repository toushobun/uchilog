"use client";

import SyncAltIcon from "@mui/icons-material/SyncAlt";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Fragment, useSyncExternalStore } from "react";

import { serverFallbackTimeZone } from "config/dateTime";
import type {
  CategorySummaryItem,
  TransactionItemSummaryStatType,
  TransactionRowItem,
} from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import {
  formatTransactionRowAmount,
  formatTransactionTime,
} from "utils/transactions";

export type TransactionRowProps = {
  item: TransactionRowItem;
  receiptCard?: boolean;
  showAccount?: boolean;
  showRecorder?: boolean;
  showTime?: boolean;
};

type TagItem = { name: string; color?: string | null };

type ReceiptTransactionRowItem = TransactionRowItem & {
  tagNames?: string[];
  tagItems?: TagItem[];
};

const textColor = "var(--user-theme-tx-name)";
const mutedText = "var(--user-theme-tx-meta)";
const expenseColor = "var(--user-theme-negative-amount)";
const incomeColor = "var(--user-theme-income-amount)";
const themeDotColor = "var(--user-theme-tx-accent)";

export function TransactionRow({
  item,
  receiptCard = false,
  showAccount = false,
  showRecorder = false,
  showTime = false,
}: TransactionRowProps) {
  const receiptItem = item as ReceiptTransactionRowItem;
  const isTransfer = item.type === "transfer";
  const merchantName = isTransfer
    ? "账户周转"
    : (item.merchant_name ?? "未知商家");
  const amountColor = isTransfer
    ? themeDotColor
    : item.type === "income"
      ? incomeColor
      : expenseColor;
  const timeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getBrowserTimeZone,
    getServerTimeZone,
  );
  const time = formatTransactionTime(item.transaction_at, { timeZone });
  const signedAmount = formatRowAmount(item);
  const categorySummaryText = getTransactionCategorySummaryText(item);
  const detailText = [categorySummaryText, item.note]
    .filter(Boolean)
    .join(" | ");
  const nonTagMetaItems = [
    showAccount ? item.account_name : null,
    showRecorder ? (item.recorder_name ?? null) : null,
  ].filter(Boolean) as string[];
  const timeItem = showTime ? time : null;

  const resolvedTagItems: TagItem[] = receiptItem.tagItems
    ? receiptItem.tagItems
    : (receiptItem.tagNames ?? []).map((name) => ({ name, color: null }));
  const uniqueTagItems = Array.from(
    new Map(resolvedTagItems.map((t) => [t.name, t])).values(),
  );

  const metaSegments: Array<string | "tags"> = [
    ...nonTagMetaItems,
    ...(uniqueTagItems.length > 0 ? (["tags"] as const) : []),
    ...(timeItem ? [timeItem] : []),
  ];

  return (
    <Stack spacing={receiptCard ? 1 : 0.8} sx={{ px: 1.4, py: 1.45 }}>
      <Stack direction="row" spacing={1.2} sx={{ alignItems: "flex-start" }}>
        <Avatar
          alt={merchantName}
          src={isTransfer ? undefined : (item.merchant_icon_url ?? undefined)}
          variant="rounded"
          sx={{
            bgcolor: getAvatarBackground(item.type),
            borderRadius: 0.75,
            color: getAvatarColor(item.type),
            flexShrink: 0,
            fontSize: 15,
            fontWeight: 900,
            height: receiptCard ? 44 : 38,
            width: receiptCard ? 44 : 38,
          }}
        >
          {getAvatarFallback(item, merchantName)}
        </Avatar>

        <Stack spacing={0.55} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              minWidth: 0,
            }}
          >
            <Typography
              noWrap
              sx={{
                color: textColor,
                flex: 1,
                fontSize: 15,
                fontWeight: 900,
                minWidth: 0,
              }}
            >
              {merchantName}
            </Typography>

            <Typography
              sx={{
                color: amountColor,
                flexShrink: 0,
                fontSize: receiptCard ? 18 : 15,
                fontWeight: 900,
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              {signedAmount}
            </Typography>
          </Stack>

          {metaSegments.length > 0 ? (
            <Stack
              direction="row"
              sx={{ alignItems: "center", minWidth: 0, overflow: "hidden" }}
            >
              {metaSegments.map((segment, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <Typography
                      sx={{
                        color: mutedText,
                        flexShrink: 0,
                        fontSize: 11,
                        mx: 0.6,
                      }}
                    >
                      {"|"}
                    </Typography>
                  )}
                  {segment === "tags" ? (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      {uniqueTagItems.map((tag) => (
                        <Box
                          key={tag.name}
                          sx={{
                            bgcolor: tag.color ?? mutedText,
                            border: "1px solid",
                            borderColor: "rgba(0,0,0,0.12)",
                            borderRadius: "999px",
                            flexShrink: 0,
                            px: 0.75,
                            py: 0.1,
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              color: getTagTextColor(tag.color),
                              fontSize: 10,
                              fontWeight: 700,
                              lineHeight: 1.6,
                            }}
                          >
                            {tag.name}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography noWrap sx={{ color: mutedText, fontSize: 11 }}>
                      {segment}
                    </Typography>
                  )}
                </Fragment>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      {detailText ? (
        <Typography
          noWrap
          sx={{
            color: mutedText,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {detailText}
        </Typography>
      ) : null}
    </Stack>
  );
}

function formatRowAmount(item: TransactionRowItem) {
  const amountValue = Number(item.amount);

  if (
    item.type !== "transfer" &&
    Number.isFinite(amountValue) &&
    amountValue === 0
  ) {
    return "0";
  }

  return formatTransactionRowAmount(item.type, item.amount);
}

function getTransactionCategorySummaryText(item: TransactionRowItem) {
  if (item.type === "transfer" || item.categoryItems.length === 0) return null;

  if (item.categoryItems.length === 1) {
    return item.categoryItems[0]?.categoryName ?? null;
  }

  if (item.categoryItems.length <= 3) {
    return item.categoryItems
      .map((category) => category.categoryName)
      .join("、");
  }

  const targetTone = getCategoryTargetTone(item);
  const topCategories = item.categoryItems
    .filter(
      (category) =>
        getCategoryTone(category.statType, item.type) === targetTone,
    )
    .sort(compareCategoryAmountDesc)
    .slice(0, 3);

  if (topCategories.length === 0) return null;

  return `${topCategories
    .map((category) => category.categoryName)
    .join("、")}等 ${item.categoryItems.length} 项`;
}

function getCategoryTargetTone(item: TransactionRowItem): "income" | "expense" {
  return item.type === "income" ? "income" : "expense";
}

function getCategoryTone(
  statType: TransactionItemSummaryStatType | undefined,
  fallbackType: TransactionRowItem["type"],
): "income" | "expense" {
  const normalizedType = statType ?? fallbackType;

  if (normalizedType === "income" || normalizedType === "expense_offset") {
    return "income";
  }

  return "expense";
}

function compareCategoryAmountDesc(
  categoryA: CategorySummaryItem,
  categoryB: CategorySummaryItem,
) {
  const amountA = Number(categoryA.amount);
  const amountB = Number(categoryB.amount);

  if (!Number.isFinite(amountA) && !Number.isFinite(amountB)) return 0;
  if (!Number.isFinite(amountA)) return 1;
  if (!Number.isFinite(amountB)) return -1;

  return amountB - amountA;
}

function getAvatarBackground(type: TransactionRowItem["type"]) {
  if (type === "income") return "var(--user-theme-income-bg)";
  if (type === "transfer") return "var(--user-theme-transfer-bg)";
  return "var(--user-theme-negative-bg)";
}

function getAvatarColor(type: TransactionRowItem["type"]) {
  if (type === "income") return incomeColor;
  if (type === "transfer") return themeDotColor;
  return expenseColor;
}

function getAvatarFallback(item: TransactionRowItem, merchantName: string) {
  if (item.type === "transfer") return <SyncAltIcon fontSize="small" />;
  if (item.merchant_name === null) return "?";
  return getMerchantInitial(merchantName, "?");
}

function getTagTextColor(bgColor: string | null | undefined): string {
  if (!bgColor || !bgColor.startsWith("#") || bgColor.length < 7) {
    return "#ffffff";
  }
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  // relative luminance (simplified)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

function subscribeToTimeZone() {
  return () => {};
}

function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getServerTimeZone() {
  return serverFallbackTimeZone;
}
