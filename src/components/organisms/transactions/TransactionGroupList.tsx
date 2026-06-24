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
import {
  receiptAccentColor,
  receiptCardBorder,
  receiptExpenseColor,
  receiptTextColor,
} from "theme/receiptColors";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import type { ServerAction } from "types/actions";
import type { TransactionDateGroup } from "types/transactions";
import { formatNumber } from "utils/transactions";

type TransactionGroupListProps = {
  groups: TransactionDateGroup[];
  voidAction?: ServerAction;
};

const cardBorder = receiptCardBorder;
const textColor = receiptTextColor;

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
                borderTop: "1px solid rgba(133, 77, 14, 0.18)",
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
                sx={{ color: textColor, fontSize: 15, fontWeight: 900 }}
              >
                {group.label}
              </Typography>
              <Box
                sx={{
                  bgcolor: "rgba(133, 77, 14, 0.16)",
                  flex: 1,
                  height: 1,
                }}
              />
            </Stack>
            <Typography
              sx={{
                color: "rgba(74, 47, 27, 0.48)",
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
                <Box
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
                    bgcolor: "rgba(255, 255, 255, 0.86)",
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 1.5,
                    boxShadow: "0 8px 18px rgba(120, 53, 15, 0.05)",
                    cursor: "pointer",
                    outline: "none",
                    overflow: "hidden",
                    position: "relative",
                    pt: "15px",
                    pb: "12px",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                    "&:focus:not(:focus-visible)": { outline: "none" },
                    "&:focus-visible": {
                      outline: "2px solid rgba(217, 119, 6, 0.5)",
                      outlineOffset: "-2px",
                    },
                    "&::before": {
                      backgroundImage: `radial-gradient(circle at 6px 10px, rgba(244, 229, 210, 0.5) 6px, transparent 6px)`,
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "12px 10px",
                      content: '""',
                      height: 10,
                      left: 0,
                      pointerEvents: "none",
                      position: "absolute",
                      right: 0,
                      top: 0,
                      zIndex: 1,
                    },
                    "&::after": {
                      backgroundImage: `radial-gradient(circle at 6px 0px, rgba(244, 229, 210, 0.18) 6px, transparent 6px)`,
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "12px 10px",
                      bottom: 0,
                      content: '""',
                      height: 10,
                      left: 0,
                      pointerEvents: "none",
                      position: "absolute",
                      right: 0,
                      zIndex: 1,
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
                          borderTop: "1px solid rgba(133, 77, 14, 0.1)",
                          p: 1,
                        }}
                      >
                        <Button
                          component={Link}
                          href={transactionEditHref(item.id)}
                          size="small"
                          startIcon={<EditRoundedIcon />}
                          sx={{
                            bgcolor: "rgba(217, 119, 6, 0.09)",
                            borderRadius: 2,
                            color: receiptAccentColor,
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 800,
                            "&:hover": {
                              bgcolor: "rgba(217, 119, 6, 0.16)",
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
                                bgcolor: "rgba(251, 113, 133, 0.09)",
                                borderRadius: 2,
                                color: receiptExpenseColor,
                                fontSize: 12,
                                fontWeight: 800,
                                "&:hover": {
                                  bgcolor: "rgba(251, 113, 133, 0.16)",
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
                </Box>
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
  if (Number(group.summary.expense) > 0) {
    return `支出 ¥${formatNumber(group.summary.expense)}`;
  }

  if (Number(group.summary.income) > 0) {
    return `收入 ¥${formatNumber(group.summary.income)}`;
  }

  return `合计 ¥${formatNumber(group.summary.balance)}`;
}
