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

const timeGroupByValues = ["year", "quarter", "month", "week", "day"] as const;

export function isTransactionTimeGroupBy(
  groupBy: TransactionGroupBy,
): groupBy is (typeof timeGroupByValues)[number] {
  return timeGroupByValues.includes(
    groupBy as (typeof timeGroupByValues)[number],
  );
}

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
      const timeGroup = getTimeGroupInfo(groupBy, record.transaction_at);
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key: timeGroup.key,
        label: timeGroup.label,
        transactionAt: record.transaction_at,
      });
      addRecordToGroup(group, record, recordItems);
      continue;
    }

    if (groupBy === "merchant") {
      const key = record.merchant_id ?? "unknown";
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key,
        label: record.merchant_id
          ? (merchantById.get(record.merchant_id)?.name ?? "未知商家")
          : "未知商家",
        transactionAt: record.transaction_at,
      });
      addRecordToGroup(group, record, recordItems);
      continue;
    }

    if (groupBy === "member") {
      const key = record.created_by ?? "unknown";
      const group = getOrCreateGroup({
        currency,
        groupBy,
        groups,
        key,
        label: record.created_by
          ? (recorderById.get(record.created_by)?.display_name ?? "未知成员")
          : "未知成员",
        transactionAt: record.transaction_at,
      });
      addRecordToGroup(group, record, recordItems);
      continue;
    }

    if (groupBy === "tag") {
      const recordTags = tagAssignmentsByRecordId.get(record.id) ?? [
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
        addRecordToGroup(group, record, recordItems);
      }
      continue;
    }

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
        addItemToGroup(group, record, item);
        continue;
      }

      if (groupBy === "parentCategory") {
        const category = item.category_id
          ? categoryById.get(item.category_id)
          : undefined;
        const parent = category?.parent_id
          ? categoryById.get(category.parent_id)
          : category;
        const key = parent?.id ?? "unknown";
        const group = getOrCreateGroup({
          currency,
          groupBy,
          groups,
          key,
          label: parent?.name ?? "未知大分类",
          transactionAt: record.transaction_at,
        });
        addItemToGroup(group, record, item);
        continue;
      }

      if (groupBy === "category") {
        const category = item.category_id
          ? categoryById.get(item.category_id)
          : undefined;
        const key = category?.id ?? "unknown";
        const group = getOrCreateGroup({
          currency,
          groupBy,
          groups,
          key,
          label: category?.name ?? "未知小分类",
          transactionAt: record.transaction_at,
        });
        addItemToGroup(group, record, item);
      }
    }
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
) {
  group.recordIds.add(record.id);

  if (record.type === "transfer") return;

  addSignedAmount(group.summary, calculateRecordNetAmount(record, items));
}

function addItemToGroup(
  group: MutableGroup,
  record: TransactionRecordDbRow,
  item: TransactionItemDbRow,
) {
  group.recordIds.add(record.id);
  addSignedAmount(group.summary, getSignedItemAmount(record, item));
}

function createSummary(currency: string): TransactionAmountSummary {
  return {
    balance: "0",
    currency,
    expense: "0",
    income: "0",
  };
}

function calculateRecordNetAmount(
  record: TransactionRecordDbRow,
  items: TransactionItemDbRow[],
) {
  return items.reduce(
    (sum, item) => sum + getSignedItemAmount(record, item),
    0,
  );
}

function getSignedItemAmount(
  record: TransactionRecordDbRow,
  item: TransactionItemDbRow,
) {
  const amount = Number(item.amount);

  if (!Number.isFinite(amount)) return 0;

  const statType = item.stat_type ?? record.type;

  if (statType === "transfer") return 0;
  if (statType === "income" || statType === "expense_offset") return amount;

  return -amount;
}

function addSignedAmount(summary: TransactionAmountSummary, amount: number) {
  if (!Number.isFinite(amount) || amount === 0) return;

  if (amount > 0) {
    summary.income = String(Number(summary.income) + amount);
  } else {
    summary.expense = String(Number(summary.expense) + Math.abs(amount));
  }

  summary.balance = String(Number(summary.balance) + amount);
}

function normalizeSummary(
  summary: TransactionAmountSummary,
): TransactionAmountSummary {
  return {
    balance: String(Number(summary.balance)),
    currency: summary.currency,
    expense: String(Number(summary.expense)),
    income: String(Number(summary.income)),
  };
}

function getTimeGroupInfo(
  groupBy: (typeof timeGroupByValues)[number],
  transactionAt: string,
) {
  const date = new Date(transactionAt);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if (groupBy === "year") {
    return { key: String(year), label: `${year}年` };
  }

  if (groupBy === "quarter") {
    const quarter = Math.floor((month - 1) / 3) + 1;
    return { key: `${year}-Q${quarter}`, label: `${year}年第${quarter}季度` };
  }

  if (groupBy === "month") {
    const monthKey = String(month).padStart(2, "0");
    return { key: `${year}-${monthKey}`, label: `${year}年${month}月` };
  }

  if (groupBy === "week") {
    const start = getUtcWeekStart(date);
    return {
      key: formatDateKey(start),
      label: `${start.getUTCFullYear()}年${start.getUTCMonth() + 1}月${start.getUTCDate()}日周`,
    };
  }

  return {
    key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`,
    label: `${year}年${month}月${day}日`,
  };
}

function getUtcWeekStart(date: Date) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = start.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setUTCDate(start.getUTCDate() + mondayOffset);

  return start;
}

function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
