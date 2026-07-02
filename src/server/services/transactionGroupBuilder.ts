import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import type {
  TransactionAmountSummary,
  TransactionGroupBy,
  TransactionGroupPage,
} from "types/transactions";

import {
  addSignedAmount,
  calculateRecordNetAmount,
  createSummary,
  getSignedTransactionItemAmount,
  normalizeSummary,
} from "./transactionAmountHelpers";
import {
  getTransactionTimeGroupInfo,
  isTransactionTimeGroupBy,
} from "./transactionListGroupTime";

export type TransactionGroupTagAssignment = {
  tagId: string;
  tagName: string;
  transactionRecordId: string;
};

export type BuildTransactionGroupSummaryPageParams = {
  accounts: AccountOptionDbRow[];
  categories: CategorySummaryDbRow[];
  currency: string;
  groupBy: TransactionGroupBy;
  items: TransactionItemDbRow[];
  merchants: { id: string; name: string }[];
  offset: number;
  pageSize: number;
  records: TransactionRecordDbRow[];
  recorders: AppUserSummaryDbRow[];
  tagAssignments: TransactionGroupTagAssignment[];
};

type MutableGroup = {
  id: string;
  key: string;
  label: string;
  latestTransactionAt: string;
  recordIds: Set<string>;
  summary: TransactionAmountSummary;
};

export function buildTransactionGroupSummaryPage({
  accounts,
  categories,
  currency,
  groupBy,
  items,
  merchants,
  offset,
  pageSize,
  records,
  recorders,
  tagAssignments,
}: BuildTransactionGroupSummaryPageParams): TransactionGroupPage {
  const safeOffset = Math.max(0, offset);
  const itemsByRecordId = groupItemsByRecordId(items);
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const merchantById = new Map(
    merchants.map((merchant) => [merchant.id, merchant]),
  );
  const recorderById = new Map(
    recorders.map((recorder) => [recorder.id, recorder]),
  );
  const tagAssignmentsByRecordId = groupTagsByRecordId(tagAssignments);
  const groups = new Map<string, MutableGroup>();

  for (const record of records) {
    const recordItems = itemsByRecordId.get(record.id) ?? [];

    if (isTransactionTimeGroupBy(groupBy)) {
      const timeGroup = getTransactionTimeGroupInfo(
        groupBy,
        record.transaction_at,
      );
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key: timeGroup.key,
        label: timeGroup.label,
        transactionAt: record.transaction_at,
      });
      addRecordToGroup(group, record, recordItems, categoryById);
      continue;
    }

    if (groupBy === "merchant") {
      const group = getMerchantGroup({
        currency,
        groupBy,
        groups,
        merchantById,
        record,
      });
      addRecordToGroup(group, record, recordItems, categoryById);
      continue;
    }

    if (groupBy === "member") {
      const group = getMemberGroup({
        currency,
        groupBy,
        groups,
        record,
        recorderById,
      });
      addRecordToGroup(group, record, recordItems, categoryById);
      continue;
    }

    if (groupBy === "tag") {
      addTagGroups({
        categoryById,
        currency,
        groupBy,
        groups,
        record,
        recordItems,
        tags: tagAssignmentsByRecordId.get(record.id),
      });
      continue;
    }

    addItemGroups({
      accountById,
      categoryById,
      currency,
      groupBy,
      groups,
      record,
      recordItems,
    });
  }

  const sortedGroups = [...groups.values()].sort((a, b) => {
    if (a.latestTransactionAt !== b.latestTransactionAt) {
      return b.latestTransactionAt.localeCompare(a.latestTransactionAt);
    }

    return a.label.localeCompare(b.label, "zh-Hans-CN");
  });
  const pageGroups = sortedGroups.slice(safeOffset, safeOffset + pageSize);

  return {
    groupBy,
    groups: pageGroups.map((group) => ({
      id: group.id,
      key: group.key,
      label: group.label,
      summary: normalizeSummary(group.summary),
      transactionCount: group.recordIds.size,
    })),
    nextOffset:
      safeOffset + pageSize < sortedGroups.length
        ? safeOffset + pageSize
        : null,
  };
}

function getMerchantGroup({
  currency,
  groupBy,
  groups,
  merchantById,
  record,
}: {
  currency: string;
  groupBy: TransactionGroupBy;
  groups: Map<string, MutableGroup>;
  merchantById: Map<string, { id: string; name: string }>;
  record: TransactionRecordDbRow;
}) {
  return getOrCreateGroup({
    currency,
    groupBy,
    groups,
    key: record.merchant_id ?? "unknown",
    label: record.merchant_id
      ? (merchantById.get(record.merchant_id)?.name ?? "未知商家")
      : "未知商家",
    transactionAt: record.transaction_at,
  });
}

function getMemberGroup({
  currency,
  groupBy,
  groups,
  record,
  recorderById,
}: {
  currency: string;
  groupBy: TransactionGroupBy;
  groups: Map<string, MutableGroup>;
  record: TransactionRecordDbRow;
  recorderById: Map<string, AppUserSummaryDbRow>;
}) {
  return getOrCreateGroup({
    currency,
    groupBy,
    groups,
    key: record.created_by ?? "unknown",
    label: record.created_by
      ? (recorderById.get(record.created_by)?.display_name ?? "未知成员")
      : "未知成员",
    transactionAt: record.transaction_at,
  });
}

function addTagGroups({
  categoryById,
  currency,
  groupBy,
  groups,
  record,
  recordItems,
  tags,
}: {
  categoryById: Map<string, CategorySummaryDbRow>;
  currency: string;
  groupBy: TransactionGroupBy;
  groups: Map<string, MutableGroup>;
  record: TransactionRecordDbRow;
  recordItems: TransactionItemDbRow[];
  tags: TransactionGroupTagAssignment[] | undefined;
}) {
  const recordTags = tags ?? [
    {
      tagId: "untagged",
      tagName: "无标签",
      transactionRecordId: record.id,
    },
  ];

  for (const tag of recordTags) {
    const group = getOrCreateGroup({
      currency,
      groupBy,
      groups,
      key: tag.tagId,
      label: tag.tagName,
      transactionAt: record.transaction_at,
    });
    addRecordToGroup(group, record, recordItems, categoryById);
  }
}

function addItemGroups({
  accountById,
  categoryById,
  currency,
  groupBy,
  groups,
  record,
  recordItems,
}: {
  accountById: Map<string, AccountOptionDbRow>;
  categoryById: Map<string, CategorySummaryDbRow>;
  currency: string;
  groupBy: TransactionGroupBy;
  groups: Map<string, MutableGroup>;
  record: TransactionRecordDbRow;
  recordItems: TransactionItemDbRow[];
}) {
  for (const item of recordItems) {
    if (groupBy === "account") {
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key: item.account_id,
        label: accountById.get(item.account_id)?.name ?? "未知账户",
        transactionAt: record.transaction_at,
      });
      addItemToGroup(group, record, item, categoryById);
      continue;
    }

    if (groupBy === "parentCategory") {
      const category = item.category_id
        ? categoryById.get(item.category_id)
        : undefined;
      const parent = category?.parent_id
        ? categoryById.get(category.parent_id)
        : category;
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key: parent?.id ?? "unknown",
        label: parent?.name ?? "未知大分类",
        transactionAt: record.transaction_at,
      });
      addItemToGroup(group, record, item, categoryById);
      continue;
    }

    if (groupBy === "category") {
      const category = item.category_id
        ? categoryById.get(item.category_id)
        : undefined;
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key: category?.id ?? "unknown",
        label: category?.name ?? "未知小分类",
        transactionAt: record.transaction_at,
      });
      addItemToGroup(group, record, item, categoryById);
    }
  }
}

function groupItemsByRecordId(items: TransactionItemDbRow[]) {
  const itemsByRecordId = new Map<string, TransactionItemDbRow[]>();

  for (const item of items) {
    const recordItems = itemsByRecordId.get(item.transaction_record_id) ?? [];
    recordItems.push(item);
    itemsByRecordId.set(item.transaction_record_id, recordItems);
  }

  return itemsByRecordId;
}

function groupTagsByRecordId(tagAssignments: TransactionGroupTagAssignment[]) {
  const tagAssignmentsByRecordId = new Map<
    string,
    TransactionGroupTagAssignment[]
  >();

  for (const assignment of tagAssignments) {
    const recordTags =
      tagAssignmentsByRecordId.get(assignment.transactionRecordId) ?? [];
    recordTags.push(assignment);
    tagAssignmentsByRecordId.set(assignment.transactionRecordId, recordTags);
  }

  return tagAssignmentsByRecordId;
}

function getOrCreateGroup({
  currency,
  groupBy,
  groups,
  key,
  label,
  transactionAt,
}: {
  currency: string;
  groupBy: TransactionGroupBy;
  groups: Map<string, MutableGroup>;
  key: string;
  label: string;
  transactionAt: string;
}) {
  const id = `${groupBy}:${key}`;
  const group = groups.get(id) ?? {
    id,
    key,
    label,
    latestTransactionAt: transactionAt,
    recordIds: new Set<string>(),
    summary: createSummary(currency),
  };

  if (transactionAt > group.latestTransactionAt) {
    group.latestTransactionAt = transactionAt;
  }

  groups.set(id, group);

  return group;
}

function addRecordToGroup(
  group: MutableGroup,
  record: TransactionRecordDbRow,
  items: TransactionItemDbRow[],
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  group.recordIds.add(record.id);

  if (record.type === "transfer") return;

  addSignedAmount(group.summary, calculateRecordNetAmount(items, categoryById));
}

function addItemToGroup(
  group: MutableGroup,
  record: TransactionRecordDbRow,
  item: TransactionItemDbRow,
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  group.recordIds.add(record.id);

  if (record.type === "transfer") return;

  addSignedAmount(
    group.summary,
    getSignedTransactionItemAmount(item, categoryById),
  );
}
