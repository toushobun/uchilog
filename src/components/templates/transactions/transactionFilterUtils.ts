import type {
  TransactionFilterOptions,
  TransactionFilters,
  TransactionGroupBy,
} from "types/transactions";

import { recordTypeOptions } from "./transactionFilterConfig";

export function getResultLabel(
  groupBy: TransactionGroupBy,
  hasActiveFilters: boolean,
) {
  const groupLabel = getGroupDisplayLabel(groupBy);

  if (hasActiveFilters) {
    return groupBy === "month" ? "筛选结果如下" : `${groupLabel}，筛选结果如下`;
  }

  return groupBy === "month" ? null : groupLabel;
}

export function getGroupDisplayLabel(groupBy: TransactionGroupBy) {
  const labelByGroup: Record<TransactionGroupBy, string> = {
    account: "按账户显示",
    category: "按小分类显示",
    day: "按日显示",
    member: "按成员显示",
    merchant: "按商家显示",
    month: "按月显示",
    parentCategory: "按大分类显示",
    quarter: "按季显示",
    tag: "按标签显示",
    week: "按周显示",
    year: "按年显示",
  };

  return labelByGroup[groupBy];
}

export function hasActiveTransactionFilters(filters: TransactionFilters) {
  return (
    filters.recordType !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    Boolean(filters.merchantId) ||
    Boolean(filters.accountId) ||
    Boolean(filters.tagId) ||
    Boolean(filters.parentCategoryId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.memberId)
  );
}

export function buildActiveFilterChips(
  filters: TransactionFilters,
  filterOptions: TransactionFilterOptions,
) {
  const chips: string[] = [];
  const recordTypeLabel = recordTypeOptions.find(
    (option) => option.value === filters.recordType,
  )?.label;

  if (filters.recordType !== "all" && recordTypeLabel) {
    chips.push(recordTypeLabel);
  }
  if (filters.dateFrom || filters.dateTo) {
    chips.push(`${filters.dateFrom ?? "开始"}〜${filters.dateTo ?? "结束"}`);
  }

  pushOptionChip(chips, filterOptions.merchants, filters.merchantId, "name");
  pushOptionChip(chips, filterOptions.accounts, filters.accountId, "name");
  pushOptionChip(chips, filterOptions.tags, filters.tagId, "name");
  pushCategoryChip(chips, filterOptions, filters.parentCategoryId);
  pushCategoryChip(chips, filterOptions, filters.categoryId);
  pushOptionChip(chips, filterOptions.members, filters.memberId, "name");

  return chips;
}

export function serializeTransactionFilters(filters: TransactionFilters) {
  return [
    filters.recordType,
    filters.dateFrom ?? "",
    filters.dateTo ?? "",
    filters.merchantId ?? "",
    filters.accountId ?? "",
    filters.tagId ?? "",
    filters.parentCategoryId ?? "",
    filters.categoryId ?? "",
    filters.memberId ?? "",
  ].join(":");
}

export function normalizeDraftValue(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function pushOptionChip<T extends { id: string }>(
  chips: string[],
  options: T[],
  selectedId: string | undefined,
  labelKey: keyof T,
) {
  if (!selectedId) return;

  const option = options.find((item) => item.id === selectedId);
  const label = option?.[labelKey];

  if (typeof label === "string") chips.push(label);
}

function pushCategoryChip(
  chips: string[],
  filterOptions: TransactionFilterOptions,
  selectedId: string | undefined,
) {
  if (!selectedId) return;

  const category = filterOptions.categories.find(
    (item) => item.id === selectedId,
  );
  if (!category) return;

  chips.push(
    category.parentName
      ? `${category.parentName} / ${category.name}`
      : category.name,
  );
}
