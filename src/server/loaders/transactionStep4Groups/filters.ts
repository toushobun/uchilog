import { serverFallbackTimeZone } from "config/dateTime";
import type {
  CategorySummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import { getTransactionRecordCategoryType } from "server/services/transactionAmountHelpers";
import type { TransactionFilters } from "types/transactions";
import { defaultTransactionFilters } from "types/transactions";
import {
  getDateKeyInTimeZone,
  isDateText as isDateKey,
} from "utils/transactions";

import { getTransactionGroupContextLookups } from "./context";
import { matchesParentCategory } from "./groupMatching";
import type { TransactionGroupLoaderContext } from "./types";

export function filterTransactionRecords(
  context: TransactionGroupLoaderContext,
  filters: TransactionFilters,
) {
  const normalizedFilters = normalizeTransactionFilters(filters);
  const lookups = getTransactionGroupContextLookups(context);
  const { categoryById, itemsByRecordId, tagsByRecordId } = lookups;

  return context.records.filter((record) => {
    const recordItems = itemsByRecordId.get(record.id) ?? [];
    const recordTags = tagsByRecordId.get(record.id) ?? [];

    if (!matchesDateRange(record, normalizedFilters)) return false;
    if (
      !matchesRecordType(record, recordItems, categoryById, normalizedFilters)
    ) {
      return false;
    }
    if (
      normalizedFilters.merchantId &&
      record.merchant_id !== normalizedFilters.merchantId
    ) {
      return false;
    }
    if (
      normalizedFilters.memberId &&
      record.created_by !== normalizedFilters.memberId
    ) {
      return false;
    }
    if (
      normalizedFilters.accountId &&
      !recordItems.some(
        (item) => item.account_id === normalizedFilters.accountId,
      )
    ) {
      return false;
    }
    if (
      normalizedFilters.parentCategoryId &&
      !recordItems.some((item) =>
        matchesParentCategory(
          item,
          categoryById,
          normalizedFilters.parentCategoryId,
        ),
      )
    ) {
      return false;
    }
    if (
      normalizedFilters.categoryId &&
      !recordItems.some(
        (item) => item.category_id === normalizedFilters.categoryId,
      )
    ) {
      return false;
    }
    if (
      normalizedFilters.tagId &&
      !recordTags.some((tag) => tag.tag_id === normalizedFilters.tagId)
    ) {
      return false;
    }

    return true;
  });
}

function normalizeTransactionFilters(
  filters: TransactionFilters,
): TransactionFilters {
  return {
    ...defaultTransactionFilters,
    ...filters,
    accountId: normalizeOptionalValue(filters.accountId),
    categoryId: normalizeOptionalValue(filters.categoryId),
    dateFrom: normalizeOptionalValue(filters.dateFrom),
    dateTo: normalizeOptionalValue(filters.dateTo),
    memberId: normalizeOptionalValue(filters.memberId),
    merchantId: normalizeOptionalValue(filters.merchantId),
    parentCategoryId: normalizeOptionalValue(filters.parentCategoryId),
    tagId: normalizeOptionalValue(filters.tagId),
  };
}

function normalizeOptionalValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function matchesDateRange(
  record: TransactionRecordDbRow,
  filters: TransactionFilters,
) {
  const dateKey = getDateKeyInTimeZone(
    record.transaction_at,
    serverFallbackTimeZone,
  );

  if (
    filters.dateFrom &&
    isDateKey(filters.dateFrom) &&
    dateKey < filters.dateFrom
  ) {
    return false;
  }
  if (filters.dateTo && isDateKey(filters.dateTo) && dateKey > filters.dateTo) {
    return false;
  }

  return true;
}

function matchesRecordType(
  record: TransactionRecordDbRow,
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
  filters: TransactionFilters,
) {
  if (filters.recordType === "all") return true;
  if (filters.recordType === "transfer") return record.type === "transfer";
  if (record.type === "transfer") return false;

  return (
    getTransactionRecordCategoryType(items, categoryById) === filters.recordType
  );
}
