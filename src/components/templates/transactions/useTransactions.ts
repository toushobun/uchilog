import { useMemo, useRef, useState, useTransition } from "react";

import type {
  TransactionFilterOptions,
  TransactionFilters,
  TransactionGroupBy,
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { defaultTransactionFilters } from "types/transactions";

import {
  buildActiveFilterChips,
  getResultLabel,
  hasActiveTransactionFilters,
  serializeTransactionFilters,
} from "./transactionFilterUtils";

export type UseTransactionsParams = {
  filterOptions: TransactionFilterOptions;
  isLoading: boolean;
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

export function useTransactions({
  filterOptions,
  isLoading,
  loadFilteredGroupItemsAction,
  loadFilteredGroupsAction,
  loadGroupItemsAction,
  loadGroupViewAction,
  loadMoreGroupsAction,
  timeGroupView,
}: UseTransactionsParams) {
  const [groupView, setGroupView] = useState(timeGroupView);
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>(
    defaultTransactionFilters,
  );
  const [draftGroupBy, setDraftGroupBy] = useState<TransactionGroupBy>(
    timeGroupView.groupBy,
  );
  const [draftFilters, setDraftFilters] = useState<TransactionFilters>(
    defaultTransactionFilters,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDialogErrorMessage, setFilterDialogErrorMessage] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const latestRequestIdRef = useRef(0);

  const appliedFilterKey = useMemo(
    () => serializeTransactionFilters(appliedFilters),
    [appliedFilters],
  );
  const hasActiveFilters = hasActiveTransactionFilters(appliedFilters);
  const hasCustomGroup = groupView.groupBy !== "month";
  const hasActiveDisplaySettings = hasActiveFilters || hasCustomGroup;
  const resultLabel = getResultLabel(groupView.groupBy, hasActiveFilters);
  const activeFilterChips = useMemo(
    () => buildActiveFilterChips(appliedFilters, filterOptions),
    [appliedFilters, filterOptions],
  );
  const displayLoading = isLoading || isPending;
  const showFilterEmptyState =
    hasActiveFilters && groupView.groups.length === 0;

  function loadGroupItems(groupKey: string, offset: number) {
    if (loadFilteredGroupItemsAction) {
      return loadFilteredGroupItemsAction(
        groupView.groupBy,
        groupKey,
        offset,
        appliedFilters,
      );
    }

    if (loadGroupItemsAction) return loadGroupItemsAction(groupKey, offset);

    return Promise.resolve({ groups: [], nextOffset: null });
  }

  function loadMoreGroups(offset: number) {
    if (loadFilteredGroupsAction) {
      return loadFilteredGroupsAction(
        groupView.groupBy,
        offset,
        appliedFilters,
      );
    }

    if (loadMoreGroupsAction) return loadMoreGroupsAction(offset);

    return Promise.resolve({
      groupBy: groupView.groupBy,
      groups: [],
      nextOffset: null,
    });
  }

  function applyGroupAndFilters(
    nextGroupBy: TransactionGroupBy,
    nextFilters: TransactionFilters,
  ) {
    if (!loadGroupViewAction) {
      setAppliedFilters(nextFilters);
      setDraftFilters(nextFilters);
      setDraftGroupBy(nextGroupBy);
      setGroupView((prev) => ({ ...prev, groupBy: nextGroupBy }));
      setFilterDialogErrorMessage(null);
      setIsFilterOpen(false);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setFilterDialogErrorMessage(null);

    startTransition(async () => {
      try {
        const nextView = await loadGroupViewAction(nextGroupBy, nextFilters);

        if (latestRequestIdRef.current !== requestId) return;

        setGroupView(nextView);
        setAppliedFilters(nextFilters);
        setDraftFilters(nextFilters);
        setDraftGroupBy(nextGroupBy);
        setIsFilterOpen(false);
      } catch {
        if (latestRequestIdRef.current !== requestId) return;
        setFilterDialogErrorMessage("筛选结果读取失败，请稍后重试。");
      }
    });
  }

  function clearFilters() {
    applyGroupAndFilters(groupView.groupBy, defaultTransactionFilters);
  }

  function openFilterDialog() {
    setDraftGroupBy(groupView.groupBy);
    setDraftFilters(appliedFilters);
    setFilterDialogErrorMessage(null);
    setIsFilterOpen(true);
  }

  function closeFilterDialog() {
    setFilterDialogErrorMessage(null);
    setIsFilterOpen(false);
  }

  function resetDraftFilters() {
    setFilterDialogErrorMessage(null);
    setDraftGroupBy("month");
    setDraftFilters(defaultTransactionFilters);
  }

  function applyDraftFilters() {
    applyGroupAndFilters(draftGroupBy, draftFilters);
  }

  return {
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
    onApplyDraftFilters: applyDraftFilters,
    onChangeDraftFilters: setDraftFilters,
    onChangeDraftGroupBy: setDraftGroupBy,
    openFilterDialog,
    resetDraftFilters,
    resultLabel,
    showFilterEmptyState,
  };
}
