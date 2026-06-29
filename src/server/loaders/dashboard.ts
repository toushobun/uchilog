"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  AccountOptionDbRow,
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import { buildTransactionListItem } from "server/loaders/buildTransactionListItem";
import { getDashboardDateRange } from "server/loaders/dashboardDateRange";
import { loadCategoriesByIdsWithParents } from "server/loaders/loadCategoriesByIdsWithParents";
import type { DashboardViewData } from "types/dashboard";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
} from "utils/transactions";

type DashboardAccountDbRow = AccountOptionDbRow & {
  type: string;
  current_balance: number | string;
  sort_order: number;
  created_at: string;
};

export async function loadDashboardView(): Promise<DashboardViewData> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const { monthStartIso, monthEndIso, monthLabel } = getDashboardDateRange();

  const [{ data: recordData, error: recordError }, { data: recentRecordData }] =
    await Promise.all([
      supabase
        .from("transaction_record")
        .select("id, type, transaction_at, merchant_id, note, created_at")
        .eq("ledger_id", currentLedger.id)
        .eq("status", "active")
        .eq("type", "normal")
        .gte("transaction_at", monthStartIso)
        .lt("transaction_at", monthEndIso)
        .order("transaction_at", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false }),
      // 单独查最近 100 条全类型记录用于账户排序，不限本月、包含 transfer
      supabase
        .from("transaction_record")
        .select("id")
        .eq("ledger_id", currentLedger.id)
        .eq("status", "active")
        .order("transaction_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (recordError) throw new Error("Failed to load dashboard records");

  const records = (recordData ?? []) as TransactionRecordDbRow[];
  const recordIds = records.map((record) => record.id);
  const recentRecordIds = (recentRecordData ?? []).map((r) => r.id);

  const [{ data: itemData, error: itemError }, { data: recentItemData }] =
    await Promise.all([
      recordIds.length > 0
        ? supabase
            .from("transaction_item")
            .select("transaction_record_id, account_id, category_id, amount")
            .eq("ledger_id", currentLedger.id)
            .in("transaction_record_id", recordIds)
        : Promise.resolve({ data: [], error: null }),
      recentRecordIds.length > 0
        ? supabase
            .from("transaction_item")
            .select("transaction_record_id, account_id")
            .eq("ledger_id", currentLedger.id)
            .in("transaction_record_id", recentRecordIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (itemError) throw new Error("Failed to load dashboard items");

  const items = (itemData ?? []) as TransactionItemDbRow[];
  const itemsByRecordId = new Map<string, TransactionItemDbRow[]>();

  for (const item of items) {
    const recordItems = itemsByRecordId.get(item.transaction_record_id) ?? [];
    recordItems.push(item);
    itemsByRecordId.set(item.transaction_record_id, recordItems);
  }

  const recentRecords = records.slice(0, 5);
  const recentRecordItems = recentRecords.flatMap(
    (record) => itemsByRecordId.get(record.id) ?? [],
  );
  const recentAccountIds = [
    ...new Set(recentRecordItems.map((item) => item.account_id)),
  ];
  const recentItemsByRecordId = new Map<string, string[]>();

  for (const item of (recentItemData ?? []) as {
    transaction_record_id: string;
    account_id: string;
  }[]) {
    const ids = recentItemsByRecordId.get(item.transaction_record_id) ?? [];
    ids.push(item.account_id);
    recentItemsByRecordId.set(item.transaction_record_id, ids);
  }

  const recentlyUsedAccountIds = getRecentlyUsedAccountIds(
    recentRecordIds,
    recentItemsByRecordId,
  );
  const categoryIds = [
    ...new Set(
      items
        .map((item) => item.category_id)
        .filter((categoryId): categoryId is string => categoryId !== null),
    ),
  ];
  const merchantIds = [
    ...new Set(
      recentRecords
        .map((record) => record.merchant_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [
    recentAccountResult,
    accountSummaryResult,
    categories,
    merchantResult,
  ] = await Promise.all([
    recentAccountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", recentAccountIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("account")
      .select(
        "id, name, type, currency, current_balance, sort_order, created_at",
      )
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    loadCategoriesByIdsWithParents(categoryIds, currentLedger.id),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (recentAccountResult.error) {
    throw new Error("Failed to load recent accounts");
  }

  if (accountSummaryResult.error) {
    throw new Error("Failed to load dashboard account summaries");
  }

  if (merchantResult.error) throw new Error("Failed to load recent merchants");

  const recentAccounts = (recentAccountResult.data ??
    []) as AccountOptionDbRow[];
  const dashboardAccounts = (accountSummaryResult.data ??
    []) as DashboardAccountDbRow[];
  const merchants = (merchantResult.data ?? []) as MerchantSummaryDbRow[];
  const accountById = new Map(
    recentAccounts.map((account) => [account.id, account] as const),
  );
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const merchantById = new Map(
    merchants.map((merchant) => [merchant.id, merchant] as const),
  );
  const monthSummary = createTransactionAmountSummary(
    currentLedger.baseCurrency,
  );

  for (const record of records) {
    const recordItems = itemsByRecordId.get(record.id) ?? [];
    const netAmount = recordItems.reduce(
      (sum, item) => sum + getSignedDashboardItemAmount(item, categoryById),
      0,
    );

    if (!Number.isFinite(netAmount) || netAmount === 0) continue;

    addTransactionAmount(
      monthSummary,
      netAmount > 0 ? "income" : "expense",
      String(Math.abs(netAmount)),
    );
  }

  const recentTransactions = recentRecords.map((record) =>
    buildTransactionListItem({
      accountById,
      categoryById,
      fallbackCurrency: currentLedger.baseCurrency,
      merchantById,
      record,
      recordItems: itemsByRecordId.get(record.id) ?? [],
    }),
  );
  const accountSummaries = sortDashboardAccountsByRecentUse(
    dashboardAccounts,
    recentlyUsedAccountIds,
  ).slice(0, 5);

  return {
    monthLabel,
    monthSummary,
    accountSummaries: accountSummaries.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.current_balance,
    })),
    recentTransactions,
  };
}

function getSignedDashboardItemAmount(
  item: TransactionItemDbRow,
  categoryById: Map<string, CategorySummaryDbRow>,
) {
  const amount = Number(item.amount);

  if (!Number.isFinite(amount)) return 0;

  const categoryType = item.category_id
    ? categoryById.get(item.category_id)?.type
    : undefined;

  if (categoryType === "income") return amount;
  if (categoryType === "expense") return -amount;

  return 0;
}

function getRecentlyUsedAccountIds(
  recordIds: string[],
  itemsByRecordId: Map<string, string[]>,
) {
  const seen = new Set<string>();

  for (const recordId of recordIds) {
    for (const accountId of itemsByRecordId.get(recordId) ?? []) {
      seen.add(accountId);
    }
  }

  return [...seen];
}

function sortDashboardAccountsByRecentUse(
  accounts: DashboardAccountDbRow[],
  recentlyUsedAccountIds: string[],
) {
  const recentIndexByAccountId = new Map(
    recentlyUsedAccountIds.map((id, index) => [id, index] as const),
  );

  return [...accounts].sort((a, b) => {
    const aIndex = recentIndexByAccountId.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = recentIndexByAccountId.get(b.id) ?? Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;

    return a.created_at.localeCompare(b.created_at);
  });
}
