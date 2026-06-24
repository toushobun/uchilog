import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  receiptAccentColor,
  receiptCardBorder,
  receiptPageBackground,
  receiptPatternColor,
  receiptTextColor,
} from "theme/receiptColors";
import { TransactionMonthList } from "organisms/transactions/TransactionMonthList";
import type { ServerAction } from "types/actions";
import type {
  TransactionMonthPage,
  TransactionMonthViewData,
} from "types/transactions";

type TransactionsTemplateProps = {
  errorMessage: string | null;
  loadMoreAction: (offset: number) => Promise<TransactionMonthPage>;
  monthView: TransactionMonthViewData;
  voidAction: ServerAction;
};

const pageBg = receiptPageBackground;
const textColor = receiptTextColor;

export function TransactionsTemplate({
  errorMessage,
  loadMoreAction,
  monthView,
  voidAction,
}: TransactionsTemplateProps) {
  return (
    <Box
      sx={{
        bgcolor: pageBg,
        boxShadow: `0 0 0 100vmax ${pageBg}`,
        clipPath: "inset(0 -100vmax)",
        color: textColor,
        minHeight: "100dvh",
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 3 },
        py: { xs: 2.4, sm: 3 },
      }}
    >
      <Stack spacing={2.2}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900 }}>
            小票明细
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              icon={<FilterListRoundedIcon />}
              label="筛选"
              sx={{ bgcolor: receiptPatternColor, fontWeight: 800 }}
            />
            <Chip
              label={monthView.monthLabel}
              sx={{
                bgcolor: "rgba(255, 238, 194, 0.95)",
                color: receiptAccentColor,
                fontWeight: 900,
              }}
            />
          </Stack>
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
    </Box>
  );
}
