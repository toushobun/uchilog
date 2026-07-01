"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { transactionEditHref } from "config/paths";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import type { TransactionDateGroup } from "types/transactions";
import { getCurrencySymbol } from "utils/currency";
import { formatNumber } from "utils/transactions";

type TransactionGroupListProps = {
  groups: TransactionDateGroup[];
  showSummary?: boolean;
};

export function TransactionGroupList({
  groups,
  showSummary = true,
}: TransactionGroupListProps) {
  return (
    <Stack spacing={1.2}>
      {groups.map((group, groupIndex) => (
        <Stack key={group.date} spacing={0.55}>
          {groupIndex > 0 ? (
            <Box
              aria-hidden="true"
              sx={{ borderTop: "1px solid var(--user-theme-card-border)" }}
            />
          ) : null}

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Stack
              direction="row"
              spacing={1.1}
              sx={{ alignItems: "center", flex: 1, minWidth: 0 }}
            >
              <Typography
                sx={{ color: "text.primary", fontSize: 15, fontWeight: 700 }}
              >
                {group.label}
              </Typography>
              <Box
                sx={{
                  bgcolor: "var(--user-theme-card-border)",
                  flex: 1,
                  height: 1,
                }}
              />
            </Stack>
            {showSummary ? (
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {getGroupSummaryText(group)}
              </Typography>
            ) : null}
          </Stack>

          <Box>
            {group.items.map((item, itemIndex) => {
              const isLastItem = itemIndex === group.items.length - 1;
              return (
                <Box
                  key={item.id}
                  component={Link}
                  href={transactionEditHref(item.id)}
                  sx={{
                    borderBottom: isLastItem
                      ? "none"
                      : "1px solid var(--user-theme-card-border)",
                    color: "inherit",
                    display: "block",
                    outline: "none",
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                    "&:focus-visible": {
                      outline: "2px solid var(--user-theme-action-text)",
                      outlineOffset: "-2px",
                    },
                  }}
                >
                  <TransactionRow
                    item={item}
                    showAccount
                    showTime
                    showRecorder
                  />
                </Box>
              );
            })}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function getGroupSummaryText(group: TransactionDateGroup) {
  const expense = Number(group.summary.expense);
  const income = Number(group.summary.income);
  const currencySymbol = getCurrencySymbol(group.summary.currency);

  if (income > 0 && expense > 0) {
    return `收入 ${currencySymbol}${formatNumber(group.summary.income)} / 支出 ${currencySymbol}${formatNumber(
      group.summary.expense,
    )} / 合计 ${formatSignedAmount(group.summary.balance, currencySymbol)}`;
  }

  if (expense > 0) {
    return `支出 ${currencySymbol}${formatNumber(group.summary.expense)}`;
  }

  if (income > 0) {
    return `收入 ${currencySymbol}${formatNumber(group.summary.income)}`;
  }

  return `合计 ${formatSignedAmount(group.summary.balance, currencySymbol)}`;
}

function formatSignedAmount(amount: string, currencySymbol: string) {
  const value = Number(amount);

  if (!Number.isFinite(value))
    return `${currencySymbol}${formatNumber(amount)}`;
  if (value === 0) return `${currencySymbol}0`;

  const sign = value > 0 ? "+" : "-";
  return `${sign}${currencySymbol}${formatNumber(String(Math.abs(value)))}`;
}
