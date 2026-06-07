import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionMonthList } from "transactions/TransactionMonthList";
import type {
  TransactionMonthPage,
  TransactionMonthView,
} from "types/transactions";

type TransactionsHomeProps = {
  errorMessage: string | null;
  loadMoreAction: (offset: number) => Promise<TransactionMonthPage>;
  monthView: TransactionMonthView;
  voidAction: (formData: FormData) => void | Promise<void>;
};

const monthNavigationBackground = "#f4efff";

export function TransactionsHome({
  errorMessage,
  loadMoreAction,
  monthView,
  voidAction,
}: TransactionsHomeProps) {
  return (
    <Stack spacing={2.2}>
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900 }}>
          明细
        </Typography>
      </Stack>

      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          bgcolor: monthNavigationBackground,
          borderRadius: 999,
          color: "text.secondary",
          height: 44,
          justifyContent: "space-between",
          px: 1.3,
        }}
      >
        <Button
          href={`/transactions?month=${monthView.previousMonth}`}
          size="small"
          sx={{ color: "text.secondary", minWidth: 40 }}
        >
          ‹
        </Button>
        <Typography sx={{ fontWeight: 800 }}>{monthView.monthLabel}</Typography>
        <Button
          href={`/transactions?month=${monthView.nextMonth}`}
          size="small"
          sx={{ color: "text.secondary", minWidth: 40 }}
        >
          ›
        </Button>
      </Stack>

      {errorMessage ? (
        <Typography color="error" sx={{ fontWeight: 700 }} variant="body2">
          {errorMessage}
        </Typography>
      ) : null}

      <TransactionMonthList
        loadMoreAction={loadMoreAction}
        monthView={monthView}
        voidAction={voidAction}
      />
    </Stack>
  );
}
