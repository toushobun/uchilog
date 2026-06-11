import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  CategorySummaryDbRow,
  MerchantSummaryDbRow,
  TransactionItemDbRow,
  TransactionRecordDbRow,
} from "server/db-types";
import { loadCategoriesByIdsWithParents } from "server/loaders/loadCategoriesByIdsWithParents";
import { buildStatisticsViewData } from "utils/statistics";
import { getMonthBounds, normalizeMonth } from "utils/transactions";

export async function loadStatisticsView(month?: string | null) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const normalizedMonth = normalizeMonth(month);
  const { startIso, endIso } = getMonthBounds(normalizedMonth);

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select("id, type, merchant_id")
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", ["expense", "income"])
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso);

  if (recordError) {
    throw new Error("Failed to load statistics records");
  }

  const records = (recordData ?? []) as TransactionRecordDbRow[];
  const recordIds = records.map((record) => record.id);
  const { data: itemData, error: itemError } = recordIds.length
    ? await supabase
        .from("transaction_item")
        .select("transaction_record_id, category_id, amount")
        .eq("ledger_id", currentLedger.id)
        .in("transaction_record_id", recordIds)
    : { data: [], error: null };

  if (itemError) {
    throw new Error("Failed to load statistics items");
  }

  const items = (itemData ?? []) as TransactionItemDbRow[];
  const merchantIds = [
    ...new Set(
      records
        .map((record) => record.merchant_id)
        .filter((merchantId): merchantId is string => merchantId !== null),
    ),
  ];
  const categoryIds = [
    ...new Set(
      items
        .map((item) => item.category_id)
        .filter((categoryId): categoryId is string => categoryId !== null),
    ),
  ];

  const [merchantResult, categories] = await Promise.all([
    merchantIds.length
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
    loadCategoriesByIdsWithParents(categoryIds, currentLedger.id),
  ]);

  if (merchantResult.error) {
    throw new Error("Failed to load statistics merchants");
  }

  return buildStatisticsViewData({
    categories: categories as CategorySummaryDbRow[],
    currency: currentLedger.baseCurrency,
    items,
    ledgerName: currentLedger.name,
    merchants: (merchantResult.data ?? []) as MerchantSummaryDbRow[],
    month: normalizedMonth,
    records,
  });
}
