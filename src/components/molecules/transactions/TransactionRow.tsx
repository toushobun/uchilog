"use client";

import SyncAltIcon from "@mui/icons-material/SyncAlt";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { serverFallbackTimeZone } from "config/dateTime";
import { transactionEditHref } from "config/paths";
import { transactionAccentColor } from "theme/transactionColors";
import {
  receiptAccentColor,
  receiptExpenseColor,
  receiptIncomeColor,
  receiptMutedText,
  receiptTextColor,
} from "theme/receiptColors";
import type { ServerAction } from "types/actions";
import type {
  CategorySummaryItem,
  TransactionRowItem,
} from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import {
  formatNumber,
  formatTransactionRowAmount,
  formatTransactionTime,
  getCategoryLabel,
} from "utils/transactions";

export type TransactionRowProps = {
  item: TransactionRowItem;
  receiptCard?: boolean;
  showAccount?: boolean;
  showEdit?: boolean;
  showNote?: boolean;
  showRecorder?: boolean;
  showTime?: boolean;
  showType?: boolean;
  voidAction?: ServerAction;
};

type ReceiptCategoryItem = CategorySummaryItem & {
  specialLabel?: string;
  specialTone?: "blue" | "orange" | "pink" | "teal";
};

type ReceiptTransactionRowItem = TransactionRowItem & {
  tagNames?: string[];
};

const textColor = receiptTextColor;
const mutedText = receiptMutedText;
const expenseColor = receiptExpenseColor;
const incomeColor = receiptIncomeColor;
const themeDotColor = receiptAccentColor;
const tagStyles = [
  { bgcolor: "#fee2e2", color: "#be123c" },
  { bgcolor: "#ccfbf1", color: "#0f766e" },
  { bgcolor: "#dbeafe", color: "#1d4ed8" },
  { bgcolor: "#fef3c7", color: "#b45309" },
] as const;

export function TransactionRow({
  item,
  receiptCard = false,
  showAccount = false,
  showEdit = false,
  showNote = false,
  showRecorder = false,
  showTime = false,
  showType = false,
  voidAction,
}: TransactionRowProps) {
  const receiptItem = item as ReceiptTransactionRowItem;
  const isTransfer = item.type === "transfer";
  const merchantName = isTransfer
    ? "账户周转"
    : (item.merchant_name ?? "未指定商家");
  const amountColor = isTransfer
    ? transactionAccentColor
    : item.type === "income"
      ? incomeColor
      : expenseColor;
  const timeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getBrowserTimeZone,
    getServerTimeZone,
  );
  const time = formatTransactionTime(item.transaction_at, { timeZone });
  const signedAmount = formatTransactionRowAmount(item.type, item.amount);
  const categoryLabel = getCategoryLabel(item.categoryItems);
  const receiptCategoryItems = item.categoryItems as ReceiptCategoryItem[];
  const categoryTags = getCategoryTags(receiptItem.tagNames);
  const shouldShowBreakdown = receiptCard && receiptCategoryItems.length > 0;

  const metaItems = [
    showTime ? time : null,
    showAccount ? item.account_name : null,
    showRecorder ? (item.recorder_name ?? null) : null,
  ].filter(Boolean);
  const metaText = metaItems.join(" · ");

  return (
    <Stack spacing={receiptCard ? 1 : 0.3} sx={{ px: 1.4, py: 1.45 }}>
      <Stack direction="row" spacing={1.3} sx={{ alignItems: "flex-start" }}>
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
          {isTransfer ? (
            <SyncAltIcon fontSize="small" />
          ) : (
            getMerchantInitial(item.merchant_name, "记")
          )}
        </Avatar>

        <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
          {showType ? (
            <Chip
              color={getTypeChipColor(item.type)}
              label={getTypeLabel(item.type)}
              size="small"
              sx={{ alignSelf: "flex-start" }}
            />
          ) : null}

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Stack spacing={0.12} sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={0.8}
                sx={{ alignItems: "baseline", minWidth: 0 }}
              >
                <Typography
                  noWrap
                  sx={{ color: textColor, fontSize: 15, fontWeight: 900 }}
                >
                  {merchantName}
                </Typography>
                {receiptCard && showNote && item.note ? (
                  <Typography
                    noWrap
                    sx={{
                      color: mutedText,
                      fontSize: 11,
                      flexShrink: 1,
                      minWidth: 0,
                    }}
                  >
                    {item.note}
                  </Typography>
                ) : null}
              </Stack>
              {metaText || categoryTags.length > 0 ? (
                <Stack
                  direction="row"
                  spacing={0.7}
                  sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.4 }}
                >
                  {metaText ? (
                    <Typography noWrap sx={{ color: mutedText, fontSize: 11 }}>
                      {metaText}
                    </Typography>
                  ) : null}
                  {categoryTags.map((tag, index) => {
                    const style = tagStyles[index % tagStyles.length];

                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: style.bgcolor,
                          color: style.color,
                          fontSize: 11,
                          fontWeight: 800,
                          height: 22,
                        }}
                      />
                    );
                  })}
                </Stack>
              ) : null}
            </Stack>

            <Stack
              spacing={0.35}
              sx={{ alignItems: "flex-end", flexShrink: 0 }}
            >
              <Typography
                sx={{
                  color: amountColor,
                  fontSize: receiptCard ? 18 : 15,
                  fontWeight: 900,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                {signedAmount}
              </Typography>
              {item.categoryItems.length > 1 ? (
                <Typography sx={{ color: mutedText, fontSize: 10 }}>
                  {item.categoryItems.length} 条明细
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          {!receiptCard && (categoryLabel || (showNote && item.note)) ? (
            <Typography noWrap sx={{ color: mutedText, fontSize: 11 }}>
              {[categoryLabel, showNote ? item.note : null]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          ) : null}
        </Stack>
      </Stack>

      {shouldShowBreakdown ? (
        <Box
          sx={{
            bgcolor: "rgba(255, 248, 237, 0.74)",
            borderRadius: 1,
            px: 1.35,
            py: 0.8,
          }}
        >
          <Stack spacing={0.4}>
            {receiptCategoryItems.map((category, index) => (
              <Stack
                direction="row"
                key={`${category.parentCategoryName ?? "root"}-${category.categoryName}-${index}`}
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <Box
                    sx={{
                      bgcolor: themeDotColor,
                      borderRadius: "50%",
                      flexShrink: 0,
                      height: 5,
                      width: 5,
                    }}
                  />
                  <Typography
                    sx={{ color: textColor, fontSize: 12, lineHeight: 1.2 }}
                  >
                    {formatCategoryBreakdownLabel(category)}
                  </Typography>
                  {category.specialLabel ? (
                    <Chip
                      label={category.specialLabel}
                      size="small"
                      sx={{
                        ...getSpecialStatusStyle(category.specialTone),
                        fontSize: 10,
                        fontWeight: 900,
                        height: 20,
                      }}
                    />
                  ) : null}
                </Stack>
                <Typography
                  sx={{ color: textColor, fontSize: 13, fontWeight: 900 }}
                >
                  {/* TODO: 暂时以日元固定显示 ¥，后续需根据 currency 字段使用 formatAmount */}
                  ¥{formatNumber(category.amount)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ) : null}

      {showEdit || voidAction ? (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ justifyContent: "flex-end" }}
        >
          {showEdit ? (
            <Button
              component={Link}
              href={transactionEditHref(item.id)}
              size="small"
              sx={{ color: themeDotColor, minWidth: 0, typography: "caption" }}
              variant="text"
            >
              编辑
            </Button>
          ) : null}

          {voidAction ? (
            <form
              action={voidAction}
              onSubmit={(event) => {
                if (!window.confirm("确定要删除这条记录吗？")) {
                  event.preventDefault();
                }
              }}
            >
              <input name="transactionRecordId" type="hidden" value={item.id} />
              <Button
                color="error"
                size="small"
                sx={{ minWidth: 0, typography: "caption" }}
                type="submit"
                variant="text"
              >
                删除
              </Button>
            </form>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}

function getAvatarBackground(type: TransactionRowItem["type"]) {
  if (type === "income") return "#ccfbf1";
  if (type === "transfer") return "#dbeafe";
  return "#fee2e2";
}

function getAvatarColor(type: TransactionRowItem["type"]) {
  if (type === "income") return "#0f766e";
  if (type === "transfer") return transactionAccentColor;
  return "#e11d48";
}

function getCategoryTags(tagNames: string[] | undefined) {
  return Array.from(new Set(tagNames ?? [])).slice(0, 4);
}

function formatCategoryBreakdownLabel(category: CategorySummaryItem) {
  return category.parentCategoryName
    ? `${category.parentCategoryName} > ${category.categoryName}`
    : category.categoryName;
}

// TODO: 待报销 / 待退款等特殊标签后续需要从每条明细的数据结构中正式提供，
// 并按标签语义配置对应的背景色与字体色。当前仅用于 Storybook 假数据验证样式。
function getSpecialStatusStyle(
  tone: ReceiptCategoryItem["specialTone"] = "orange",
) {
  if (tone === "blue") return { bgcolor: "#dbeafe", color: "#2563eb" };
  if (tone === "pink") return { bgcolor: "#ffe4e6", color: "#e11d48" };
  if (tone === "teal") return { bgcolor: "#ccfbf1", color: "#0f766e" };

  return { bgcolor: "#fef3c7", color: "#d97706" };
}

function getTypeLabel(type: TransactionRowItem["type"]) {
  if (type === "expense") return "支出";
  if (type === "income") return "收入";
  return "转账";
}

function getTypeChipColor(type: TransactionRowItem["type"]) {
  if (type === "expense") return "default";
  if (type === "income") return "success";
  return "info";
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
