"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import {
  receiptCardBorder,
  receiptMutedText,
  receiptTextColor,
} from "theme/receiptColors";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import type { DashboardRecentTransaction } from "types/dashboard";

type DashboardRecentTransactionsProps = {
  transactions: DashboardRecentTransaction[];
};

const cardBorder = receiptCardBorder;
const textColor = receiptTextColor;

export function DashboardRecentTransactions({
  transactions,
}: DashboardRecentTransactionsProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography sx={{ color: textColor, fontSize: 15, fontWeight: 900 }}>
          近期记录
        </Typography>
        <Link
          href={routePaths.transactions}
          style={{
            color: receiptMutedText,
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          查看全部
        </Link>
      </Stack>

      <Box
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.82)",
          border: `1px solid ${cardBorder}`,
          borderRadius: 1.25,
          boxShadow: "0 8px 18px rgba(120, 53, 15, 0.05)",
          overflow: "hidden",
          px: 1.2,
        }}
      >
        {transactions.length > 0 ? (
          <Stack spacing={0}>
            {transactions.slice(0, 3).map((item) => (
              <TransactionRow
                item={item}
                key={item.id}
                showAccount
                showTime
                showNote
              />
            ))}
          </Stack>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
            variant="body2"
          >
            本月还没有记账记录。
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
