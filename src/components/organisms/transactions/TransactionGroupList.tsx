"use client";

import { useEffect, useState } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { transactionEditHref } from "config/paths";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import { ReceiptCard } from "molecules/ui/ReceiptCard";
import type { ServerAction } from "types/actions";
import type { TransactionDateGroup } from "types/transactions";
import { formatNumber } from "utils/transactions";

type TransactionGroupListProps = {
  groups: TransactionDateGroup[];
  voidAction?: ServerAction;
};

export function TransactionGroupList({
  groups,
  voidAction,
}: TransactionGroupListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!expandedId) return;
    const handleScroll = () => setExpandedId(null);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [expandedId]);

  return (
    <Stack spacing={2.2}>
      {groups.map((group, groupIndex) => (
        <Stack key={group.date} spacing={0.9}>
          {groupIndex > 0 ? (
            <Box
              aria-hidden="true"
              sx={{
                borderTop: "1px solid var(--user-theme-card-border)",
                mx: 0.2,
              }}
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
                sx={{ color: "text.primary", fontSize: 15, fontWeight: 900 }}
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
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {getGroupSummaryText(group)}
            </Typography>
          </Stack>

          <Stack spacing={1.4}>
            {group.items.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <ReceiptCard
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : item.id);
                    }
                  }}
                  sx={{
                    borderRadius: 1.5,
                    cursor: "pointer",
                    outline: "none",
                    pb: "12px",
                    pt: "15px",
                    px: 0,
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    "&:focus:not(:focus-visible)": { outline: "none" },
                    "&:focus-visible": {
                      outline: "2px solid var(--user-theme-action-text)",
                      outlineOffset: "-2px",
                    },
                  }}
                >
                  <TransactionRow
                    item={item}
                    receiptCard
                    showAccount
                    showTime
                    showNote
                    showRecorder
                  />

                  <Box onClick={(e) => e.stopPropagation()}>
                    <Collapse in={isExpanded}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          borderTop:
                            "1px solid var(--user-theme-receipt-border)",
                          p: 1,
                        }}
                      >
                        <Button
                          component={Link}
                          href={transactionEditHref(item.id)}
                          size="small"
                          startIcon={<EditRoundedIcon />}
                          sx={{
                            bgcolor: "var(--user-theme-badge-bg)",
                            borderRadius: 2,
                            color: "var(--user-theme-action-text)",
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 800,
                            "&:hover": {
                              bgcolor: "var(--user-theme-bottom-nav-active-bg)",
                            },
                          }}
                          variant="text"
                        >
                          编辑
                        </Button>
                        {voidAction ? (
                          <Box
                            component="form"
                            action={voidAction}
                            onSubmit={(event) => {
                              if (!window.confirm("确定要删除这条记录吗？")) {
                                event.preventDefault();
                              }
                            }}
                            sx={{ flex: 1 }}
                          >
                            <input
                              name="transactionRecordId"
                              type="hidden"
                              value={item.id}
                            />
                            <Button
                              fullWidth
                              size="small"
                              startIcon={<DeleteRoundedIcon />}
                              sx={{
                                bgcolor: "action.hover",
                                borderRadius: 2,
                                color: "var(--user-theme-negative-amount)",
                                fontSize: 12,
                                fontWeight: 800,
                                "&:hover": {
                                  bgcolor: "action.selected",
                                },
                              }}
                              type="submit"
                              variant="text"
                            >
                              删除
                            </Button>
                          </Box>
                        ) : null}
                      </Stack>
                    </Collapse>
                  </Box>
                </ReceiptCard>
              );
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

// TODO: 暂时以日元固定显示 ¥，后续需根据 summary.currency 字段使用 formatAmount
function getGroupSummaryText(group: TransactionDateGroup) {
  const expense = Number(group.summary.expense);
  const income = Number(group.summary.income);

  if (income > 0 && expense > 0) {
    return `收入 ¥${formatNumber(group.summary.income)} / 支出 ¥${formatNumber(
      group.summary.expense,
    )} / 合计 ${formatSignedYen(group.summary.balance)}`;
  }

  if (expense > 0) {
    return `支出 ¥${formatNumber(group.summary.expense)}`;
  }

  if (income > 0) {
    return `收入 ¥${formatNumber(group.summary.income)}`;
  }

  return `合计 ${formatSignedYen(group.summary.balance)}`;
}

function formatSignedYen(amount: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return `¥${formatNumber(amount)}`;
  if (value === 0) return "¥0";

  const sign = value > 0 ? "+" : "-";
  return `${sign}¥${formatNumber(String(Math.abs(value)))}`;
}
