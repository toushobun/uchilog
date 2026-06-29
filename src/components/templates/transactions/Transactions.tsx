"use client";

import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionMonthList } from "organisms/transactions/TransactionMonthList";
import { designTokens } from "theme/theme";
import type {
  TransactionMonthPage,
  TransactionMonthViewData,
} from "types/transactions";

type TransactionsTemplateProps = {
  errorMessage: string | null;
  loadMoreAction: (offset: number) => Promise<TransactionMonthPage>;
  monthView: TransactionMonthViewData;
};

export function TransactionsTemplate({
  errorMessage,
  loadMoreAction,
  monthView,
}: TransactionsTemplateProps) {
  return (
    <Stack spacing={2.2} sx={pageContentSx}>
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
      />
    </Stack>
  );
}

const pageContentSx = {
  px: {
    xs: designTokens.spacing.page.mobile,
    sm: designTokens.spacing.page.desktop,
  },
  py: {
    xs: designTokens.spacing.page.mobile,
    sm: designTokens.spacing.page.desktop,
  },
};
