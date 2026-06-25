"use client";

import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { TransactionRow } from "molecules/transactions/TransactionRow";
import { SectionCard } from "molecules/ui/SectionCard";
import type { DashboardRecentTransaction } from "types/dashboard";

type DashboardRecentTransactionsProps = {
  transactions: DashboardRecentTransaction[];
};

export function DashboardRecentTransactions({
  transactions,
}: DashboardRecentTransactionsProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography
          sx={{ color: "text.primary", fontSize: 15, fontWeight: 900 }}
        >
          近期记录
        </Typography>
        <MuiLink
          component={Link}
          href={routePaths.transactions}
          sx={{
            color: "text.secondary",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          查看全部
        </MuiLink>
      </Stack>

      <SectionCard
        sx={{
          borderRadius: 1.25,
          overflow: "hidden",
          px: 1.2,
          py: 0,
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
      </SectionCard>
    </Stack>
  );
}
