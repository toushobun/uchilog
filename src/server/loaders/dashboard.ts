"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  AccountRow,
  MerchantRow,
  TransactionItemRow,
  TransactionRecordRow,
} from "server/db-types";
import { buildTransactionListItem } from "server/loaders/buildTransactionListItem";
import { loadCategoriesByIdsWithParents } from "server/loaders/loadCategoriesByIdsWithParents";
import type { DashboardViewData } from "types/dashboard";
import {
  addTransactionAmount,
  createTransactionAmountSummary,
  getCurrentMonthRange,
} from "utils/transactions";

function addExpenseTotal(
  summary: { expense: string; recordCount: number },
  amount: number,
) {
  summary.expense = String(Number(summary.expense) + amount);
  summary.recordCount += 1;
}

export async function loadDashboardView(): Promise<DashboardViewData> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const { startIso, endIso, monthLabel } = getCurrentMonthRange();

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select("id, type, transaction_at, merchant_id, note, created_at")
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", ["expense", "income"])
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (recordError) throw new Error("Failed to load dashboard records");

  const records = (recordData ?? []) as TransactionRecordRow[];
  const recordIds = records.map((record) => record.id);
  const { data: itemData, error: itemError } =
    recordIds.length > 0
      ? await supabase
          .from("transaction_item")
          .select("transaction_record_id, account_id, category_id, amount")
          .eq("ledger_id", currentLedger.id)
          .in("transaction_record_id", recordIds)
      : { data: [], error: null };

  if (itemError) throw new Error("Failed to load dashboard items");

  const items = (itemData ?? []) as TransactionItemRow[];
  const itemsByRecordId = new Map<string, TransactionItemRow[]>();

  for (const item of items) {
    const recordItems = itemsByRecordId.get(item.transaction_record_id) ?? [];
    recordItems.push(item);
    itemsByRecordId.set(item.transaction_record_id, recordItems);
  }

  const monthSummary = createTransactionAmountSummary(
    currentLedger.baseCurrency,
  );
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7));

  const todayExpense = {
    expense: "0",
    currency: currentLedger.baseCurrency,
    recordCount: 0,
  };
  const weekExpense = {
    expense: "0",
    currency: currentLedger.baseCurrency,
    recordCount: 0,
  };

  for (const record of records) {
    const recordItems = itemsByRecordId.get(record.id) ?? [];
    const total = recordItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    if (!Number.isFinite(total) || total === 0) continue;

    addTransactionAmount(monthSummary, record.type, String(total));

    if (record.type === "expense") {
      const recordAt = new Date(record.transaction_at);

      if (recordAt >= weekStart) {
        addExpenseTotal(weekExpense, total);
      }

      if (recordAt >= todayStart) {
        addExpenseTotal(todayExpense, total);
      }
    }
  }

  const recentRecords = records.slice(0, 5);
  const recentRecordItems = recentRecords.flatMap(
    (record) => itemsByRecordId.get(record.id) ?? [],
  );
  const recentAccountIds = [
    ...new Set(recentRecordItems.map((item) => item.account_id)),
  ];
  const categoryIds = [
    ...new Set(
      recentRecordItems
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

  const [accountResult, categories, merchantResult] = await Promise.all([
    recentAccountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", recentAccountIds)
      : Promise.resolve({ data: [], error: null }),
    loadCategoriesByIdsWithParents(categoryIds, currentLedger.id),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (accountResult.error) throw new Error("Failed to load recent accounts");
  if (merchantResult.error) throw new Error("Failed to load recent merchants");

  const accounts = (accountResult.data ?? []) as AccountRow[];
  const merchants = (merchantResult.data ?? []) as MerchantRow[];
  const accountById = new Map(
    accounts.map((account) => [account.id, account] as const),
  );
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const merchantById = new Map(
    merchants.map((merchant) => [merchant.id, merchant] as const),
  );
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

  return {
    ledgerName: currentLedger.name,
    monthLabel,
    monthSummary,
    todayExpense,
    weekExpense,
    recentTransactions,
  };
}
