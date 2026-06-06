"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type { DashboardViewData } from "./summary-types";

type RecordRow = {
  id: string;
  type: "expense" | "income";
  transaction_at: string;
  merchant_id: string | null;
  note: string | null;
  created_at: string;
};

type ItemRow = {
  transaction_record_id: string;
  account_id: string;
  category_id: string | null;
  amount: string;
};

type AccountRow = { id: string; name: string; currency: string };
type CategoryRow = { id: string; name: string; parent_id: string | null };
type MerchantRow = { id: string; name: string; icon_url: string | null };

function getCurrentMonthBounds() {
  const current = new Date();
  const year = current.getUTCFullYear();
  const monthIndex = current.getUTCMonth();
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  return {
    endIso: end.toISOString(),
    monthLabel: `${year}年${monthIndex + 1}月`,
    startIso: start.toISOString(),
  };
}

export async function loadDashboardView(): Promise<DashboardViewData> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const { startIso, endIso, monthLabel } = getCurrentMonthBounds();

  // All month records (for summary + today/week stats)
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

  const records = (recordData ?? []) as RecordRow[];
  const recordIds = records.map((r) => r.id);

  // Items for all records
  const { data: itemData, error: itemError } =
    recordIds.length > 0
      ? await supabase
          .from("transaction_item")
          .select("transaction_record_id, account_id, category_id, amount")
          .eq("ledger_id", currentLedger.id)
          .in("transaction_record_id", recordIds)
      : { data: [], error: null };

  if (itemError) throw new Error("Failed to load dashboard items");

  const items = (itemData ?? []) as ItemRow[];

  const itemsByRecordId = new Map<string, ItemRow[]>();
  for (const item of items) {
    const arr = itemsByRecordId.get(item.transaction_record_id) ?? [];
    arr.push(item);
    itemsByRecordId.set(item.transaction_record_id, arr);
  }

  // Month summary + today/week stats
  const monthSummary = {
    balance: "0",
    currency: currentLedger.baseCurrency,
    expense: "0",
    income: "0",
  };
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
    const total = recordItems.reduce((sum, i) => sum + Number(i.amount), 0);
    if (!Number.isFinite(total) || total === 0) continue;

    if (record.type === "income") {
      monthSummary.income = String(Number(monthSummary.income) + total);
      monthSummary.balance = String(Number(monthSummary.balance) + total);
    } else {
      monthSummary.expense = String(Number(monthSummary.expense) + total);
      monthSummary.balance = String(Number(monthSummary.balance) - total);
      const recordAt = new Date(record.transaction_at);
      if (recordAt >= weekStart) {
        weekExpense.expense = String(Number(weekExpense.expense) + total);
        weekExpense.recordCount += 1;
      }
      if (recordAt >= todayStart) {
        todayExpense.expense = String(Number(todayExpense.expense) + total);
        todayExpense.recordCount += 1;
      }
    }
  }

  // Fetch related data for the 5 most recent records
  const recentRecords = records.slice(0, 5);
  const recentAccountIds = [
    ...new Set(
      recentRecords.flatMap((r) =>
        (itemsByRecordId.get(r.id) ?? []).map((i) => i.account_id),
      ),
    ),
  ];
  const merchantIds = [
    ...new Set(
      recentRecords
        .map((r) => r.merchant_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const [accountResult, categoryResult, merchantResult] = await Promise.all([
    recentAccountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", recentAccountIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("category")
      .select("id, name, parent_id")
      .eq("ledger_id", currentLedger.id),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (accountResult.error) throw new Error("Failed to load recent accounts");
  if (categoryResult.error) throw new Error("Failed to load recent categories");
  if (merchantResult.error) throw new Error("Failed to load recent merchants");

  const accountById = new Map(
    ((accountResult.data ?? []) as AccountRow[]).map((a) => [a.id, a]),
  );
  const categoryById = new Map(
    ((categoryResult.data ?? []) as CategoryRow[]).map((c) => [c.id, c]),
  );
  const merchantById = new Map(
    ((merchantResult.data ?? []) as MerchantRow[]).map((m) => [m.id, m]),
  );

  const recentTransactions = recentRecords.map((record) => {
    const recordItems = itemsByRecordId.get(record.id) ?? [];
    const firstItem = recordItems[0];
    const account = firstItem
      ? accountById.get(firstItem.account_id)
      : undefined;
    const merchant = record.merchant_id
      ? merchantById.get(record.merchant_id)
      : undefined;

    const totalAmount = recordItems.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );

    const categoryItems = recordItems.flatMap((i) => {
      if (i.category_id === null) return [];

      const cat = categoryById.get(i.category_id);
      const parent = cat?.parent_id
        ? categoryById.get(cat.parent_id)
        : undefined;

      return [
        {
          categoryName: cat?.name ?? "",
          parentCategoryName: parent?.name ?? null,
          amount: i.amount,
        },
      ];
    });

    return {
      account_currency: account?.currency ?? currentLedger.baseCurrency,
      account_name: account?.name ?? "未知账户",
      amount: String(totalAmount),
      categoryItems,
      id: record.id,
      merchant_icon_url: merchant?.icon_url ?? null,
      merchant_name: merchant?.name ?? null,
      note: record.note ?? null,
      transaction_at: record.transaction_at,
      type: record.type,
    };
  });

  return {
    ledgerName: currentLedger.name,
    monthLabel,
    monthSummary,
    todayExpense,
    weekExpense,
    recentTransactions,
  };
}
