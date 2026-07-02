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
import type { TransactionListItem } from "types/transactions";

import {
  groupItemsByRecordId,
  groupRawTagsByRecordId,
  loadTagNameMap,
} from "./tagUtils";
import {
  activeTransactionRecordTypes,
  type RawTagAssignment,
  type TransactionGroupLoaderContext,
} from "./types";

export type TransactionGroupContextLookups = {
  accountById: Map<string, AccountOptionDbRow>;
  categoryById: Map<string, CategorySummaryDbRow>;
  itemsByRecordId: Map<string, TransactionItemDbRow[]>;
  merchantById: Map<string, MerchantSummaryDbRow>;
  recorderById: Map<string, AppUserSummaryDbRow>;
  tagsByRecordId: Map<string, RawTagAssignment[]>;
};

const contextLookupsCache = new WeakMap<
  TransactionGroupLoaderContext,
  TransactionGroupContextLookups
>();

/**
 * 同一个 context 对象在一次请求内可能被多个筛选 / 分组 / 明细构建步骤复用，
 * 用 WeakMap 按 context 身份缓存派生的查找表，避免重复重建。
 */
export function getTransactionGroupContextLookups(
  context: TransactionGroupLoaderContext,
): TransactionGroupContextLookups {
  const cached = contextLookupsCache.get(context);
  if (cached) return cached;

  const lookups: TransactionGroupContextLookups = {
    accountById: new Map(
      context.accounts.map((account) => [account.id, account] as const),
    ),
    categoryById: new Map(
      context.categories.map((category) => [category.id, category] as const),
    ),
    itemsByRecordId: groupItemsByRecordId(context.items),
    merchantById: new Map(
      context.merchants.map((merchant) => [merchant.id, merchant] as const),
    ),
    recorderById: new Map(
      context.recorders.map((user) => [user.id, user] as const),
    ),
    tagsByRecordId: groupRawTagsByRecordId(context.tagAssignments),
  };

  contextLookupsCache.set(context, lookups);
  return lookups;
}

export async function loadTransactionGroupLoaderContext(): Promise<TransactionGroupLoaderContext> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
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

  if (recordError) throw new Error("Failed to load transaction records");

  return loadTransactionGroupLoaderContextForRecords(
    currentLedger,
    (recordData ?? []) as TransactionRecordDbRow[],
    supabase,
  );
}

export async function loadTransactionGroupLoaderContextForRecords(
  currentLedger: CurrentLedger,
  records: TransactionRecordDbRow[],
  supabaseClient?: Awaited<ReturnType<typeof createClient>>,
): Promise<TransactionGroupLoaderContext> {
  const supabase = supabaseClient ?? (await createClient());
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return {
      accounts: [],
      categories: [],
      currentLedger,
      items: [],
      merchants: [],
      records: [],
      recorders: [],
      tagAssignments: [],
      tagById: new Map<string, string>(),
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

  if (itemError) throw new Error("Failed to load transaction items");

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
        .filter((id): id is string => typeof id === "string"),
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

  const tagAssignments = (tagAssignmentResult.data ?? []) as RawTagAssignment[];
  const tagById = await loadTagNameMap(
    tagAssignments.map((assignment) => assignment.tag_id),
    currentLedger.id,
  );

  return {
    accounts: (accountResult.data ?? []) as AccountOptionDbRow[],
    categories,
    currentLedger,
    items,
    merchants: (merchantResult.data ?? []) as MerchantSummaryDbRow[],
    records,
    recorders: (recorderResult.data ?? []) as AppUserSummaryDbRow[],
    tagAssignments,
    tagById,
  };
}

export function buildTransactionListItemsFromContext(
  records: TransactionRecordDbRow[],
  context: TransactionGroupLoaderContext,
): TransactionListItem[] {
  const lookups = getTransactionGroupContextLookups(context);
  const tagNamesByRecordId = new Map<string, string[]>();

  for (const record of records) {
    const recordTags = lookups.tagsByRecordId.get(record.id) ?? [];
    const names = recordTags
      .map((assignment) => context.tagById.get(assignment.tag_id))
      .filter((name): name is string => Boolean(name));

    if (names.length > 0) tagNamesByRecordId.set(record.id, names);
  }

  return records.map((record) =>
    buildTransactionListItem({
      accountById: lookups.accountById,
      categoryById: lookups.categoryById,
      fallbackCurrency: context.currentLedger.baseCurrency,
      merchantById: lookups.merchantById,
      record,
      recorderById: lookups.recorderById,
      recordItems: lookups.itemsByRecordId.get(record.id) ?? [],
      tagNamesByRecordId,
    }),
  );
}
