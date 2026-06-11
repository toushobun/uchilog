"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { transactionAccentColor } from "theme/transactionColors";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import type { DashboardRecentTransaction } from "types/dashboard";

type DashboardRecentTransactionsProps = {
  transactions: DashboardRecentTransaction[];
};

export function DashboardRecentTransactions({
  transactions,
}: DashboardRecentTransactionsProps) {
  return (
    <Stack spacing={0}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 900 }}>最近记录</Typography>
        <Link
          href={routePaths.transactions}
          style={{
            color: transactionAccentColor,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          全部 →
        </Link>
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
          left: { xs: "50%", sm: "auto" },
          overflow: "hidden",
          position: { xs: "relative", sm: "static" },
          px: 1.6,
          transform: { xs: "translateX(-50%)", sm: "none" },
          width: { xs: "100vw", sm: "auto" },
        }}
      >
        {transactions.length > 0 ? (
          <Stack divider={<Divider flexItem sx={{ ml: 7.2 }} />} spacing={0}>
            {transactions.map((item) => (
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
