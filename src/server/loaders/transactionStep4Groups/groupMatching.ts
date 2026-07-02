import type {
  CategorySummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import {
  getTransactionTimeGroupInfo,
  isTransactionTimeGroupBy,
} from "server/services/transactionListGroups";
import type { TransactionGroupBy } from "types/transactions";

import type { RawTagAssignment } from "./types";

export function recordMatchesGroup({
  categoryById,
  groupBy,
  groupKey,
  items,
  record,
  tags,
}: {
  categoryById: Map<string, CategorySummaryDbRow>;
  groupBy: TransactionGroupBy;
  groupKey: string;
  items: TransactionItemDbRow[];
  record: TransactionRecordDbRow;
  tags: RawTagAssignment[];
}) {
  if (isTransactionTimeGroupBy(groupBy)) {
    return (
      getTransactionTimeGroupInfo(groupBy, record.transaction_at).key ===
      groupKey
    );
  }

  if (groupBy === "merchant") {
    return (record.merchant_id ?? "unknown") === groupKey;
  }
  if (groupBy === "member") {
    return (record.created_by ?? "unknown") === groupKey;
  }

  if (groupBy === "tag") {
    if (tags.length === 0) return groupKey === "untagged";
    return tags.some((tag) => tag.tag_id === groupKey);
  }

  if (groupBy === "account") {
    return items.some((item) => item.account_id === groupKey);
  }

  if (groupBy === "parentCategory") {
    return items.some((item) =>
      matchesParentCategory(item, categoryById, groupKey),
    );
  }

  if (groupBy === "category") {
    return items.some((item) => {
      const category = item.category_id
        ? categoryById.get(item.category_id)
        : undefined;
      return (category?.id ?? "unknown") === groupKey;
    });
  }

  return false;
}

export function matchesParentCategory(
  item: TransactionItemDbRow,
  categoryById: Map<string, CategorySummaryDbRow>,
  parentCategoryId: string | undefined,
) {
  if (!parentCategoryId) return false;

  const category = item.category_id
    ? categoryById.get(item.category_id)
    : undefined;
  const parent = category?.parent_id
    ? categoryById.get(category.parent_id)
    : category;

  return (parent?.id ?? "unknown") === parentCategoryId;
}
