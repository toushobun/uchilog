import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  transactionExpenseColor,
  transactionIncomeColor,
} from "theme/transactionColors";
import type { TransactionAmountSummary } from "types/transactions";
import { formatNumber } from "utils/transactions";

const borderPurple = "#e5dcf6";

type SummaryItemProps = {
  color?: string;
  label: string;
  value: string;
};

function SummaryItem({ color, label, value }: SummaryItemProps) {
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

export function TransactionSummaryBar({
  summary,
}: {
  summary: TransactionAmountSummary;
}) {
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
          color={transactionIncomeColor}
          label="收入"
          value={formatNumber(summary.income)}
        />
        <SummaryItem
          color={transactionExpenseColor}
          label="支出"
          value={formatNumber(summary.expense)}
        />
        <SummaryItem label="结余" value={formatNumber(summary.balance)} />
      </Stack>
    </Box>
  );
}
