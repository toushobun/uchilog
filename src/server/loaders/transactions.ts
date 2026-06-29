"use server";

import {
  getCurrentLedgerOrRedirect,
  type CurrentLedger,
} from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  AccountOptionDbRow,
  AppUserSummaryDbRow,
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import { buildTransactionListItem } from "server/loaders/buildTransactionListItem";
import { loadCategoriesByIdsWithParents } from "server/loaders/loadCategoriesByIdsWithParents";
import { buildTransactionGroupSummaryPage } from "server/services/transactionListGroups";
import type {
  TransactionGroupBy,
  TransactionGroupPage,
  TransactionListItem,
  TransactionListPage,
  TransactionMonthPage,
  TransactionMonthViewData,
} from "types/transactions";
import {
  formatMonthLabel,
  getMonthBounds,
  groupTransactionItemsByDate,
  normalizeMonth,
  shiftMonth,
} from "utils/transactions";

const transactionListPageSize = 20;
const monthPageSize = 20;
const transactionGroupPageSize = 20;
const activeTransactionRecordTypes = ["normal", "transfer"] as const;

async function loadTransactionItems(
  records: TransactionRecordDbRow[],
  currentLedger: CurrentLedger,
) {
  const supabase = await createClient();
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return [] as TransactionListItem[];
  }

  const { data: itemData, error: itemError } = await supabase
    .from("transaction_item")
    .select(
      "transaction_record_id, account_id, category_id, amount, balance_delta, note",
    )
    .eq("ledger_id", currentLedger.id)
    .in("transaction_record_id", recordIds)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (itemError) {
    throw new Error("Failed to load transaction items");
  }

  const items = (itemData ?? []) as TransactionItemDbRow[];
  const accountIds = [...new Set(items.map((item) => item.account_id))];
  const categoryIds = items
    .map((item) => item.category_id)
    .filter((categoryId): categoryId is string => categoryId !== null);
  const merchantIds = [
    ...new Set(
      records
        .map((record) => record.merchant_id)
        .filter((merchantId): merchantId is string => merchantId !== null),
    ),
  ];
  const recorderIds = [
    ...new Set(
      records
        .map((record) => record.created_by)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [
    accountResult,
    categories,
    merchantResult,
    recorderResult,
    tagAssignmentResult,
  ] = await Promise.all([
    accountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", accountIds)
      : Promise.resolve({ data: [], error: null }),
    loadCategoriesByIdsWithParents(categoryIds, currentLedger.id),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
    recorderIds.length > 0
      ? supabase
          .from("app_user")
          .select("id, display_name")
          .in("id", recorderIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("transaction_record_tag")
      .select("tag_id, transaction_record_id")
      .eq("ledger_id", currentLedger.id)
      .in("transaction_record_id", recordIds),
  ]);

  if (accountResult.error) {
    throw new Error("Failed to load transaction accounts");
  }

  if (merchantResult.error) {
    throw new Error("Failed to load transaction merchants");
  }

  if (recorderResult.error) {
    throw new Error("Failed to load transaction recorders");
  }

  if (tagAssignmentResult.error) {
    throw new Error("Failed to load transaction tags");
  }

  const tagAssignments = (tagAssignmentResult.data ?? []) as {
    tag_id: string;
    transaction_record_id: string;
  }[];
  const uniqueTagIds = [...new Set(tagAssignments.map((a) => a.tag_id))];
  const tagById = new Map<string, string>();

  if (uniqueTagIds.length > 0) {
    const { data: tagData, error: tagError } = await supabase
      .from("transaction_tag")
      .select("id, name")
      .eq("ledger_id", currentLedger.id)
      .in("id", uniqueTagIds);

    if (tagError) throw new Error("Failed to load transaction tag names");

    for (const tag of tagData ?? []) {
      tagById.set(tag.id, tag.name as string);
    }
  }

  const tagNamesByRecordId = new Map<string, string[]>();

  for (const assignment of tagAssignments) {
    const name = tagById.get(assignment.tag_id);
    if (name) {
      const names =
        tagNamesByRecordId.get(assignment.transaction_record_id) ?? [];
      names.push(name);
      tagNamesByRecordId.set(assignment.transaction_record_id, names);
    }
  }

  const accounts = (accountResult.data ?? []) as AccountOptionDbRow[];
  const merchants = (merchantResult.data ?? []) as MerchantSummaryDbRow[];
  const recorders = (recorderResult.data ?? []) as AppUserSummaryDbRow[];
  const accountById = new Map(
    accounts.map((account) => [account.id, account] as const),
  );
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const merchantById = new Map(
    merchants.map((merchant) => [merchant.id, merchant] as const),
  );
  const recorderById = new Map(
    recorders.map((user) => [user.id, user] as const),
  );
  const itemsByRecordId = new Map<string, TransactionItemDbRow[]>();

  for (const item of items) {
    const recordItems = itemsByRecordId.get(item.transaction_record_id) ?? [];
    recordItems.push(item);
    itemsByRecordId.set(item.transaction_record_id, recordItems);
  }

  return records.map((record) =>
    buildTransactionListItem({
      accountById,
      categoryById,
      fallbackCurrency: "",
      merchantById,
      record,
      recorderById,
      recordItems: itemsByRecordId.get(record.id) ?? [],
      tagNamesByRecordId,
    }),
  );
}

export async function loadTransactionGroupPage(
  groupBy: TransactionGroupBy = "month",
  offset = 0,
): Promise<TransactionGroupPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const safeOffset = Math.max(0, offset);

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", activeTransactionRecordTypes)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (recordError) {
    throw new Error("Failed to load transaction records");
  }

  const records = (recordData ?? []) as TransactionRecordDbRow[];
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return {
      groupBy,
      groups: [],
      nextOffset: null,
    };
  }

  const { data: itemData, error: itemError } = await supabase
    .from("transaction_item")
    .select(
      "transaction_record_id, account_id, category_id, amount, balance_delta, note",
    )
    .eq("ledger_id", currentLedger.id)
    .in("transaction_record_id", recordIds)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (itemError) {
    throw new Error("Failed to load transaction items");
  }

  const items = (itemData ?? []) as TransactionItemDbRow[];
  const accountIds = [...new Set(items.map((item) => item.account_id))];
  const categoryIds = [
    ...new Set(
      items
        .map((item) => item.category_id)
        .filter((categoryId): categoryId is string => categoryId !== null),
    ),
  ];
  const merchantIds = [
    ...new Set(
      records
        .map((record) => record.merchant_id)
        .filter((merchantId): merchantId is string => merchantId !== null),
    ),
  ];
  const recorderIds = [
    ...new Set(
      records
        .map((record) => record.created_by)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [
    accountResult,
    categories,
    merchantResult,
    recorderResult,
    tagAssignmentResult,
  ] = await Promise.all([
    accountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", accountIds)
      : Promise.resolve({ data: [], error: null }),
    loadCategoriesByIdsWithParents(categoryIds, currentLedger.id),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
    recorderIds.length > 0
      ? supabase
          .from("app_user")
          .select("id, display_name")
          .in("id", recorderIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("transaction_record_tag")
      .select("tag_id, transaction_record_id")
      .eq("ledger_id", currentLedger.id)
      .in("transaction_record_id", recordIds),
  ]);

  if (accountResult.error) {
    throw new Error("Failed to load transaction accounts");
  }

  if (merchantResult.error) {
    throw new Error("Failed to load transaction merchants");
  }

  if (recorderResult.error) {
    throw new Error("Failed to load transaction recorders");
  }

  if (tagAssignmentResult.error) {
    throw new Error("Failed to load transaction tags");
  }

  const rawTagAssignments = (tagAssignmentResult.data ?? []) as {
    tag_id: string;
    transaction_record_id: string;
  }[];
  const uniqueTagIds = [...new Set(rawTagAssignments.map((a) => a.tag_id))];
  const tagById = new Map<string, string>();

  if (uniqueTagIds.length > 0) {
    const { data: tagData, error: tagError } = await supabase
      .from("transaction_tag")
      .select("id, name")
      .eq("ledger_id", currentLedger.id)
      .in("id", uniqueTagIds);

    if (tagError) throw new Error("Failed to load transaction tag names");

    for (const tag of tagData ?? []) {
      tagById.set(tag.id, tag.name as string);
    }
  }

  return buildTransactionGroupSummaryPage({
    accounts: (accountResult.data ?? []) as AccountOptionDbRow[],
    categories: categories as CategorySummaryDbRow[],
    currency: currentLedger.baseCurrency,
    groupBy,
    items,
    merchants: (merchantResult.data ?? []) as { id: string; name: string }[],
    offset: safeOffset,
    pageSize: transactionGroupPageSize,
    records,
    recorders: (recorderResult.data ?? []) as AppUserSummaryDbRow[],
    tagAssignments: rawTagAssignments.flatMap((assignment) => {
      const tagName = tagById.get(assignment.tag_id);

      if (!tagName) return [];

      return [
        {
          tagId: assignment.tag_id,
          tagName,
          transactionRecordId: assignment.transaction_record_id,
        },
      ];
    }),
  });
}

export async function loadTransactionMonthView(
  month?: string | null,
): Promise<TransactionMonthViewData> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const normalizedMonth = normalizeMonth(month);
  const { startIso, endIso } = getMonthBounds(normalizedMonth);

  const { data: allRecordData, error: allRecordError } = await supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", activeTransactionRecordTypes)
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (allRecordError) {
    throw new Error("Failed to load transaction records");
  }

  const allRecords = (allRecordData ?? []) as TransactionRecordDbRow[];
  const pageRecords = allRecords.slice(0, monthPageSize);
  const hasMore = allRecords.length > monthPageSize;
  const allItems = await loadTransactionItems(allRecords, currentLedger);
  const currency = currentLedger.baseCurrency;
  const displayItems = allItems.slice(0, pageRecords.length);

  return {
    groups: groupTransactionItemsByDate(displayItems, currency),
    month: normalizedMonth,
    monthLabel: formatMonthLabel(normalizedMonth),
    nextMonth: shiftMonth(normalizedMonth, 1),
    previousMonth: shiftMonth(normalizedMonth, -1),
    nextOffset: hasMore ? monthPageSize : null,
  };
}

export async function loadTransactionMonthPage(
  month: string,
  offset: number,
): Promise<TransactionMonthPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const normalizedMonth = normalizeMonth(month);
  const { startIso, endIso } = getMonthBounds(normalizedMonth);
  const safeOffset = Math.max(0, offset);

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", activeTransactionRecordTypes)
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(safeOffset, safeOffset + monthPageSize);

  if (recordError) {
    throw new Error("Failed to load transaction records");
  }

  const fetched = (recordData ?? []) as TransactionRecordDbRow[];
  const records = fetched.slice(0, monthPageSize);
  const hasMore = fetched.length > monthPageSize;
  const items = await loadTransactionItems(records, currentLedger);
  const currency = currentLedger.baseCurrency;

  return {
    groups: groupTransactionItemsByDate(items, currency),
    nextOffset: hasMore ? safeOffset + monthPageSize : null,
  };
}

export async function loadTransactionListPage(
  offset = 0,
): Promise<TransactionListPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const safeOffset = Math.max(0, offset);

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", activeTransactionRecordTypes)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(safeOffset, safeOffset + transactionListPageSize);

  if (recordError) {
    throw new Error("Failed to load transaction records");
  }

  const fetchedRecords = (recordData ?? []) as TransactionRecordDbRow[];
  const records = fetchedRecords.slice(0, transactionListPageSize);
  const hasNextPage = fetchedRecords.length > transactionListPageSize;

  return {
    items: await loadTransactionItems(records, currentLedger),
    nextOffset: hasNextPage ? safeOffset + transactionListPageSize : null,
  };
}
