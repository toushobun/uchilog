import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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

export function TransactionsTemplate({
  errorMessage,
  loadMoreAction,
  monthView,
  voidAction,
}: TransactionsTemplateProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        boxShadow: (theme) =>
          `0 0 0 100vmax ${theme.palette.background.default}`,
        clipPath: "inset(0 -100vmax)",
        color: "text.primary",
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
              sx={{
                bgcolor: "var(--user-theme-badge-bg)",
                color: "var(--user-theme-badge-color)",
                fontWeight: 800,
              }}
            />
            <Chip
              label={monthView.monthLabel}
              sx={{
                bgcolor: "var(--user-theme-bottom-nav-active-bg)",
                color: "var(--user-theme-action-text)",
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
