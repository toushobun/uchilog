"use client";

import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "molecules/ui/EmptyState";
import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { TransactionMonthList } from "organisms/transactions/TransactionMonthList";
import { designTokens } from "theme/theme";
import type {
  TransactionFilterOptions,
  TransactionFilters,
  TransactionGroupBy,
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";

import { TransactionFilterDialog } from "./TransactionFilterDialog";
import { TransactionFilterResultSummary } from "./TransactionFilterResultSummary";
import { TransactionsSkeleton } from "./TransactionsSkeleton";
import { useTransactions } from "./useTransactions";

type TransactionsTemplateProps = {
  errorMessage: string | null;
  filterOptions?: TransactionFilterOptions;
  isLoading?: boolean;
  loadFilteredGroupItemsAction?: (
    groupBy: TransactionGroupBy,
    groupKey: string,
    offset: number,
    filters: TransactionFilters,
  ) => Promise<TransactionMonthPage>;
  loadFilteredGroupsAction?: (
    groupBy: TransactionGroupBy,
    offset: number,
    filters: TransactionFilters,
  ) => Promise<TransactionGroupPage>;
  loadGroupItemsAction?: (
    groupKey: string,
    offset: number,
  ) => Promise<TransactionMonthPage>;
  loadGroupViewAction?: (
    groupBy: TransactionGroupBy,
    filters: TransactionFilters,
  ) => Promise<TransactionTimeGroupViewData>;
  loadMoreGroupsAction?: (offset: number) => Promise<TransactionGroupPage>;
  timeGroupView: TransactionTimeGroupViewData;
};

export function TransactionsTemplate({
  errorMessage,
  filterOptions = emptyFilterOptions,
  isLoading = false,
  loadFilteredGroupItemsAction,
  loadFilteredGroupsAction,
  loadGroupItemsAction,
  loadGroupViewAction,
  loadMoreGroupsAction,
  timeGroupView,
}: TransactionsTemplateProps) {
  const {
    activeFilterChips,
    appliedFilterKey,
    clearFilters,
    closeFilterDialog,
    displayLoading,
    draftFilters,
    draftGroupBy,
    filterDialogErrorMessage,
    groupView,
    hasActiveDisplaySettings,
    hasActiveFilters,
    isFilterOpen,
    isPending,
    loadGroupItems,
    loadMoreGroups,
    onApplyDraftFilters,
    onChangeDraftFilters,
    onChangeDraftGroupBy,
    openFilterDialog,
    resetDraftFilters,
    resultLabel,
    showFilterEmptyState,
  } = useTransactions({
    filterOptions,
    isLoading,
    loadFilteredGroupItemsAction,
    loadFilteredGroupsAction,
    loadGroupItemsAction,
    loadGroupViewAction,
    loadMoreGroupsAction,
    timeGroupView,
  });

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
          <IconButton
            aria-label="筛选"
            onClick={openFilterDialog}
            sx={headerActionSx}
          >
            <Badge
              color="warning"
              invisible={!hasActiveDisplaySettings}
              overlap="circular"
              variant="dot"
            >
              <FilterAltOutlinedIcon />
            </Badge>
          </IconButton>
        </Stack>
      </Stack>

      {displayLoading ? (
        <TransactionsSkeleton />
      ) : errorMessage ? (
        <EmptyState
          action={
            <Button
              onClick={() => globalThis.location.reload()}
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
        <>
          {resultLabel ? (
            <TransactionFilterResultSummary
              chips={activeFilterChips}
              hasActiveFilters={hasActiveFilters}
              label={resultLabel}
              onClear={clearFilters}
            />
          ) : null}
          {showFilterEmptyState ? (
            <EmptyState title="没有找到符合条件的流水。" />
          ) : (
            <TransactionMonthList
              key={`${groupView.groupBy}:${appliedFilterKey}:${groupView.groups
                .map((group) => group.id)
                .join("|")}`}
              loadGroupItemsAction={loadGroupItems}
              loadMoreGroupsAction={loadMoreGroups}
              timeGroupView={groupView}
            />
          )}
        </>
      )}

      <TransactionFilterDialog
        draftFilters={draftFilters}
        draftGroupBy={draftGroupBy}
        errorMessage={filterDialogErrorMessage}
        filterOptions={filterOptions}
        isPending={isPending}
        onApply={onApplyDraftFilters}
        onChangeFilters={onChangeDraftFilters}
        onChangeGroupBy={onChangeDraftGroupBy}
        onClose={closeFilterDialog}
        onReset={resetDraftFilters}
        open={isFilterOpen}
      />
    </Stack>
  );
}

const emptyFilterOptions: TransactionFilterOptions = {
  accounts: [],
  categories: [],
  members: [],
  merchants: [],
  tags: [],
};

const pageContentSx = {
  bgcolor: "var(--user-theme-tx-page-bg)",
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
