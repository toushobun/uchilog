"use client";

import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { TransactionMonthList } from "organisms/transactions/TransactionMonthList";
import { EmptyState } from "molecules/ui/EmptyState";
import { designTokens } from "theme/theme";
import type {
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";

type TransactionsTemplateProps = {
  errorMessage: string | null;
  isLoading?: boolean;
  loadGroupItemsAction: (
    groupKey: string,
    offset: number,
  ) => Promise<TransactionMonthPage>;
  loadMoreGroupsAction: (offset: number) => Promise<TransactionGroupPage>;
  timeGroupView: TransactionTimeGroupViewData;
};

export function TransactionsTemplate({
  errorMessage,
  isLoading = false,
  loadGroupItemsAction,
  loadMoreGroupsAction,
  timeGroupView,
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

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <IconButton aria-label="搜索" sx={headerActionSx}>
            <SearchRoundedIcon />
          </IconButton>
          <IconButton aria-label="筛选" sx={headerActionSx}>
            <FilterAltOutlinedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {isLoading ? (
        <TransactionsSkeleton />
      ) : errorMessage ? (
        <EmptyState
          action={
            <Button
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: "var(--user-theme-action-bg)",
                borderRadius: 999,
                color: "var(--user-theme-action-text)",
                fontWeight: 900,
                px: 2.4,
                "&:hover": {
                  bgcolor: "var(--user-theme-field-card-selected-bg)",
                },
              }}
              variant="contained"
            >
              重新读取
            </Button>
          }
          description={errorMessage}
          title="明细读取失败"
        />
      ) : (
        <TransactionMonthList
          loadGroupItemsAction={loadGroupItemsAction}
          loadMoreGroupsAction={loadMoreGroupsAction}
          timeGroupView={timeGroupView}
        />
      )}
    </Stack>
  );
}

function TransactionsSkeleton() {
  return (
    <Stack spacing={1.2}>
      {[0, 1, 2].map((index) => (
        <Stack
          key={index}
          spacing={1.2}
          sx={{
            borderBottom: "1px solid var(--user-theme-card-border)",
            py: 1.1,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Skeleton height={24} sx={{ borderRadius: 1 }} width="36%" />
            <Skeleton height={24} sx={{ borderRadius: 1 }} width="42%" />
          </Stack>
          <Skeleton height={60} sx={{ borderRadius: 0.75 }} variant="rounded" />
          <Skeleton height={60} sx={{ borderRadius: 0.75 }} variant="rounded" />
        </Stack>
      ))}
    </Stack>
  );
}

const pageContentSx = {
  bgcolor: "var(--user-theme-card-bg)",
  mb: bottomNavigationLayout.shellPaddingBottomOffset,
  minHeight: "100dvh",
  mt: -4,
  mx: {
    xs: -designTokens.spacing.page.mobile,
    sm: -designTokens.spacing.page.desktop,
  },
  px: {
    xs: designTokens.spacing.page.mobile,
    sm: designTokens.spacing.page.desktop,
  },
  pb: bottomNavigationLayout.shellPaddingBottom,
  pt: {
    xs: designTokens.spacing.page.mobile,
    sm: designTokens.spacing.page.desktop,
  },
};

const headerActionSx = {
  color: "text.primary",
  height: 40,
  p: 0,
  transition: "background-color 120ms ease, transform 120ms ease",
  width: 40,
  "&:hover": {
    bgcolor: "var(--user-theme-badge-bg)",
  },
  "&:active": {
    bgcolor: "var(--user-theme-field-card-selected-bg)",
    transform: "translateY(1px)",
  },
};
