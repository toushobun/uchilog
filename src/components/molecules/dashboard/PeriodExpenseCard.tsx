import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { transactionExpenseColor } from "theme/transactionColors";
import { formatNumber } from "utils/transactions";

type PeriodExpenseCardProps = {
  expense: string;
  label: string;
  recordCount: number;
};

export function PeriodExpenseCard({
  expense,
  label,
  recordCount,
}: PeriodExpenseCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
        flex: 1,
        p: 1.8,
      }}
    >
      <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.6 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          color: transactionExpenseColor,
          fontSize: 20,
          fontWeight: 900,
          lineHeight: 1.2,
        }}
      >
        -{formatNumber(expense)}
      </Typography>
      {recordCount > 0 ? (
        <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.4 }}>
          共 {recordCount} 笔记录
        </Typography>
      ) : null}
    </Box>
  );
}
