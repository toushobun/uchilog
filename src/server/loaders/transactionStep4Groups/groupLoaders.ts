"use server";

import {
  getCurrentLedgerOrRedirect,
  type CurrentLedger,
} from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";
import type { TransactionRecordDbRow } from "server/db-types";
import {
  buildTransactionGroupSummaryPage,
  isTransactionTimeGroupBy,
} from "server/services/transactionListGroups";
import {
  getTransactionTimeGroupInfo,
  type TransactionTimeGroupBy,
} from "server/services/transactionListGroupTime";
import type {
  TransactionFilters,
  TransactionGroupBy,
  TransactionGroupPage,
  TransactionMonthPage,
  TransactionTimeGroupViewData,
} from "types/transactions";
import { defaultTransactionFilters } from "types/transactions";
import {
  getMonthBounds,
  groupTransactionItemsByDate,
  isDateText as isDateKey,
} from "utils/transactions";

import {
  buildTransactionListItemsFromContext,
  getTransactionGroupContextLookups,
  loadTransactionGroupLoaderContext,
  loadTransactionGroupLoaderContextForRecords,
} from "./context";
import { filterTransactionRecords } from "./filters";
import { recordMatchesGroup } from "./groupMatching";
import { buildGroupTagAssignments } from "./tagUtils";
import {
  activeTransactionRecordTypes,
  transactionPageSize,
  type TransactionGroupLoaderContext,
} from "./types";

const transactionRecordScanPageSize = 100;

export async function loadStep4TransactionGroupView(
  groupBy: TransactionGroupBy = "month",
  filters: TransactionFilters = defaultTransactionFilters,
): Promise<TransactionTimeGroupViewData> {
  const groupPage = await loadStep4TransactionGroupPage(groupBy, 0, filters);
  const initialGroup = groupPage.groups[0] ?? null;
  const shouldExpandInitialGroup = isTransactionTimeGroupBy(groupBy);
  const initialPage =
    shouldExpandInitialGroup && initialGroup
      ? await loadStep4TransactionGroupItemsPage(
          groupBy,
          initialGroup.key,
          0,
          filters,
        )
      : null;

  return {
    groupBy,
    groups: groupPage.groups,
    initialDateGroupsByGroupId:
      initialGroup && initialPage
        ? { [initialGroup.id]: initialPage.groups }
        : {},
    initialExpandedGroupId:
      shouldExpandInitialGroup && initialGroup ? initialGroup.id : null,
    initialNextItemOffsetByGroupId:
      initialGroup && initialPage
        ? { [initialGroup.id]: initialPage.nextOffset }
        : {},
    nextOffset: groupPage.nextOffset,
  };
}

export async function loadStep4TransactionGroupPage(
  groupBy: TransactionGroupBy,
  offset: number,
  filters: TransactionFilters = defaultTransactionFilters,
): Promise<TransactionGroupPage> {
  // 时间维度分组的分组边界与记录扫描顺序（按 transaction_at 倒序）严格单调，
  // 可以增量分批扫描、只在拿到足够多"已闭合"分组后停止，避免拉取整个 ledger。
  // 商家 / 账户 / 分类 / 标签 / 成员等非时间维度分组的记录不按时间连续分布，
  // 单个分组的完整汇总在不引入 SQL 侧聚合查询前仍需要完整上下文，暂保留原实现。
  if (isTransactionTimeGroupBy(groupBy)) {
    return loadStep4TimeGroupedTransactionGroupPage(groupBy, offset, filters);
  }

  const context = await loadTransactionGroupLoaderContext();

  return buildStep4TransactionGroupPageFromContext(
    context,
    groupBy,
    offset,
    filters,
  );
}

async function loadStep4TimeGroupedTransactionGroupPage(
  groupBy: TransactionTimeGroupBy,
  offset: number,
  filters: TransactionFilters,
): Promise<TransactionGroupPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const safeOffset = Math.max(0, offset);
  const targetGroupCount = safeOffset + transactionPageSize + 1;
  const dateBounds = getFilterDateBounds(filters);

  if (dateBounds?.isEmpty) {
    return { groupBy, groups: [], nextOffset: null };
  }

  const scannedRecords: TransactionRecordDbRow[] = [];
  let scanOffset = 0;
  let filteredGroupKeyCount = 0;
  let context = await loadTransactionGroupLoaderContextForRecords(
    currentLedger,
    scannedRecords,
    supabase,
  );

  while (filteredGroupKeyCount < targetGroupCount) {
    const query = buildTransactionRecordScanQuery({
      currentLedger,
      dateBounds,
      filters,
      supabase,
    });
    const { data, error } = await query
      .order("transaction_at", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(scanOffset, scanOffset + transactionRecordScanPageSize - 1);

    if (error) throw new Error("Failed to load transaction records");

    const candidateRecords = (data ?? []) as TransactionRecordDbRow[];
    if (candidateRecords.length === 0) break;

    scannedRecords.push(...candidateRecords);
    scanOffset += candidateRecords.length;

    context = await loadTransactionGroupLoaderContextForRecords(
      currentLedger,
      scannedRecords,
      supabase,
    );
    const filteredRecords = filterTransactionRecords(context, filters);
    const filteredGroupKeys = new Set(
      filteredRecords.map(
        (record) =>
          getTransactionTimeGroupInfo(groupBy, record.transaction_at).key,
      ),
    );
    filteredGroupKeyCount = filteredGroupKeys.size;

    if (candidateRecords.length < transactionRecordScanPageSize) break;
  }

  return buildStep4TransactionGroupPageFromContext(
    context,
    groupBy,
    offset,
    filters,
  );
}

export async function loadStep4TransactionGroupItems(
  groupBy: TransactionGroupBy,
  groupKey: string,
  offset: number,
  filters: TransactionFilters = defaultTransactionFilters,
): Promise<TransactionMonthPage> {
  return loadStep4TransactionGroupItemsPage(groupBy, groupKey, offset, filters);
}

function buildStep4TransactionGroupPageFromContext(
  context: TransactionGroupLoaderContext,
  groupBy: TransactionGroupBy,
  offset: number,
  filters: TransactionFilters,
): TransactionGroupPage {
  const filteredRecords = filterTransactionRecords(context, filters);
  const filteredRecordIds = new Set(filteredRecords.map((record) => record.id));
  const filteredItems = context.items.filter((item) =>
    filteredRecordIds.has(item.transaction_record_id),
  );

  return buildTransactionGroupSummaryPage({
    accounts: context.accounts,
    categories: context.categories,
    currency: context.currentLedger.baseCurrency,
    groupBy,
    items: filteredItems,
    merchants: context.merchants,
    offset,
    pageSize: transactionPageSize,
    records: filteredRecords,
    recorders: context.recorders,
    tagAssignments: buildGroupTagAssignments(context),
  });
}

async function loadStep4TransactionGroupItemsPage(
  groupBy: TransactionGroupBy,
  groupKey: string,
  offset: number,
  filters: TransactionFilters,
): Promise<TransactionMonthPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const safeOffset = Math.max(0, offset);
  const targetCount = safeOffset + transactionPageSize + 1;
  const recordDateBounds = mergeDateBounds(
    getTimeGroupDateBounds(groupBy, groupKey),
    getFilterDateBounds(filters),
  );

  if (
    recordDateBounds?.isEmpty ||
    hasRecordLevelConflict(groupBy, groupKey, filters)
  ) {
    return { groups: [], nextOffset: null };
  }

  const matchingRecords: TransactionRecordDbRow[] = [];
  let scanOffset = 0;

  while (matchingRecords.length < targetCount) {
    const query = buildTransactionRecordScanQuery({
      currentLedger,
      dateBounds: recordDateBounds,
      filters,
      groupKeyPushDown: { groupBy, groupKey },
      supabase,
    });
    const { data, error } = await query
      .order("transaction_at", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(scanOffset, scanOffset + transactionRecordScanPageSize - 1);

    if (error) throw new Error("Failed to load transaction records");

    const candidateRecords = (data ?? []) as TransactionRecordDbRow[];
    if (candidateRecords.length === 0) break;

    const candidateContext = await loadTransactionGroupLoaderContextForRecords(
      currentLedger,
      candidateRecords,
      supabase,
    );
    const filteredRecords = filterTransactionRecords(candidateContext, filters);
    matchingRecords.push(
      ...filterRecordsByGroup(
        candidateContext,
        filteredRecords,
        groupBy,
        groupKey,
      ),
    );

    scanOffset += candidateRecords.length;
    if (candidateRecords.length < transactionRecordScanPageSize) break;
  }

  const fetchedRecords = matchingRecords.slice(
    safeOffset,
    safeOffset + transactionPageSize + 1,
  );
  const pageRecords = fetchedRecords.slice(0, transactionPageSize);
  const pageContext = await loadTransactionGroupLoaderContextForRecords(
    currentLedger,
    pageRecords,
    supabase,
  );
  const items = buildTransactionListItemsFromContext(pageRecords, pageContext);

  return {
    groups: groupTransactionItemsByDate(items, currentLedger.baseCurrency),
    nextOffset:
      fetchedRecords.length > transactionPageSize
        ? safeOffset + transactionPageSize
        : null,
  };
}

function filterRecordsByGroup(
  context: TransactionGroupLoaderContext,
  records: TransactionRecordDbRow[],
  groupBy: TransactionGroupBy,
  groupKey: string,
) {
  const { categoryById, itemsByRecordId, tagsByRecordId } =
    getTransactionGroupContextLookups(context);

  return records.filter((record) =>
    recordMatchesGroup({
      categoryById,
      groupBy,
      groupKey,
      items: itemsByRecordId.get(record.id) ?? [],
      record,
      tags: tagsByRecordId.get(record.id) ?? [],
    }),
  );
}

function buildTransactionRecordScanQuery({
  currentLedger,
  dateBounds,
  filters,
  groupKeyPushDown,
  supabase,
}: {
  currentLedger: CurrentLedger;
  dateBounds: DateBounds | undefined;
  filters: TransactionFilters;
  groupKeyPushDown?: { groupBy: TransactionGroupBy; groupKey: string };
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  let query = supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", activeTransactionRecordTypes);

  if (dateBounds?.startIso) {
    query = query.gte("transaction_at", dateBounds.startIso);
  }
  if (dateBounds?.endIso) {
    query = query.lt("transaction_at", dateBounds.endIso);
  }
  if (filters.recordType === "transfer") {
    query = query.eq("type", "transfer");
  } else if (
    filters.recordType === "income" ||
    filters.recordType === "expense"
  ) {
    query = query.eq("type", "normal");
  }
  if (filters.merchantId) {
    query = query.eq("merchant_id", filters.merchantId);
  } else if (groupKeyPushDown?.groupBy === "merchant") {
    query =
      groupKeyPushDown.groupKey === "unknown"
        ? query.is("merchant_id", null)
        : query.eq("merchant_id", groupKeyPushDown.groupKey);
  }
  if (filters.memberId) {
    query = query.eq("created_by", filters.memberId);
  } else if (groupKeyPushDown?.groupBy === "member") {
    query =
      groupKeyPushDown.groupKey === "unknown"
        ? query.is("created_by", null)
        : query.eq("created_by", groupKeyPushDown.groupKey);
  }

  return query;
}

function hasRecordLevelConflict(
  groupBy: TransactionGroupBy,
  groupKey: string,
  filters: TransactionFilters,
) {
  if (groupBy === "merchant" && filters.merchantId) {
    return filters.merchantId !== groupKey;
  }
  if (groupBy === "member" && filters.memberId) {
    return filters.memberId !== groupKey;
  }

  return false;
}

type DateBounds = {
  endIso?: string;
  isEmpty?: boolean;
  startIso?: string;
};

function mergeDateBounds(
  first: DateBounds | undefined,
  second: DateBounds | undefined,
): DateBounds | undefined {
  const startIso = maxIso(first?.startIso, second?.startIso);
  const endIso = minIso(first?.endIso, second?.endIso);

  if (!startIso && !endIso) return undefined;

  return {
    endIso,
    isEmpty: Boolean(startIso && endIso && startIso >= endIso),
    startIso,
  };
}

function getFilterDateBounds(
  filters: TransactionFilters,
): DateBounds | undefined {
  return mergeDateBounds(
    filters.dateFrom && isDateKey(filters.dateFrom)
      ? { startIso: getLocalDateStartUtcIso(filters.dateFrom) }
      : undefined,
    filters.dateTo && isDateKey(filters.dateTo)
      ? {
          endIso: getLocalDateStartUtcIso(addDaysToDateKey(filters.dateTo, 1)),
        }
      : undefined,
  );
}

function getTimeGroupDateBounds(
  groupBy: TransactionGroupBy,
  groupKey: string,
): DateBounds | undefined {
  if (groupBy === "year" && /^\d{4}$/.test(groupKey)) {
    const year = Number(groupKey);
    return {
      endIso: getLocalDateStartUtcIso(`${year + 1}-01-01`),
      startIso: getLocalDateStartUtcIso(`${year}-01-01`),
    };
  }

  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(groupKey);
  if (groupBy === "quarter" && quarterMatch) {
    const year = Number(quarterMatch[1]);
    const quarter = Number(quarterMatch[2]);
    const startMonth = (quarter - 1) * 3 + 1;
    return {
      endIso: getLocalDateStartUtcIso(formatDateKey(year, startMonth + 3, 1)),
      startIso: getLocalDateStartUtcIso(formatDateKey(year, startMonth, 1)),
    };
  }

  if (groupBy === "month" && /^\d{4}-\d{2}$/.test(groupKey)) {
    return getMonthBounds(groupKey);
  }

  if (groupBy === "week" && isDateKey(groupKey)) {
    return {
      endIso: getLocalDateStartUtcIso(addDaysToDateKey(groupKey, 7)),
      startIso: getLocalDateStartUtcIso(groupKey),
    };
  }

  if (groupBy === "day" && isDateKey(groupKey)) {
    return {
      endIso: getLocalDateStartUtcIso(addDaysToDateKey(groupKey, 1)),
      startIso: getLocalDateStartUtcIso(groupKey),
    };
  }

  return undefined;
}

function getLocalDateStartUtcIso(dateKey: string) {
  return new Date(`${dateKey}T00:00:00+09:00`).toISOString();
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return formatDateKey(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

function formatDateKey(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function maxIso(left: string | undefined, right: string | undefined) {
  if (!left) return right;
  if (!right) return left;

  return left > right ? left : right;
}

function minIso(left: string | undefined, right: string | undefined) {
  if (!left) return right;
  if (!right) return left;

  return left < right ? left : right;
}
