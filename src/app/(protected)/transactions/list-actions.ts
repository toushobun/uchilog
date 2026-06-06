"use server";

import {
  getCurrentLedgerOrRedirect,
  type CurrentLedger,
} from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  TransactionAmountSummary,
  TransactionDateGroup,
  TransactionListItem,
  TransactionListPage,
  TransactionMonthPage,
  TransactionMonthView,
  TransactionType,
} from "./types";

const transactionListPageSize = 20;
const monthPageSize = 20;
const weekDayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

type TransactionRecordRow = {
  id: string;
  type: "expense" | "income";
  transaction_at: string;
  merchant_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

type AppUserRow = {
  id: string;
  display_name: string;
};

type TransactionItemRow = {
  transaction_record_id: string;
  account_id: string;
  category_id: string | null;
  amount: string;
  note: string | null;
};

type AccountRow = {
  id: string;
  name: string;
  currency: string;
};

type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
};

type MerchantRow = {
  id: string;
  name: string;
  icon_url: string | null;
};

function normalizeMonth(month?: string | null) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  const current = new Date();
  const year = current.getUTCFullYear();
  const monthValue = String(current.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${monthValue}`;
}

function getMonthBounds(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

function shiftMonth(month: string, delta: number) {
  const [yearText, monthText] = month.split("-");
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1 + delta, 1),
  );
  const year = date.getUTCFullYear();
  const monthValue = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${monthValue}`;
}

function formatMonthLabel(month: string) {
  const [yearText, monthText] = month.split("-");

  return `${yearText}年${Number(monthText)}月`;
}

function formatDateKey(value: string) {
  return value.slice(0, 10);
}

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${month}/${day} ${weekDayLabels[date.getUTCDay()]}`;
}

function createSummary(currency: string): TransactionAmountSummary {
  return {
    balance: "0",
    currency,
    expense: "0",
    income: "0",
  };
}

function addAmount(
  summary: TransactionAmountSummary,
  type: TransactionType,
  amount: string,
) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return;
  }

  if (type === "income") {
    summary.income = String(Number(summary.income) + value);
    summary.balance = String(Number(summary.balance) + value);
    return;
  }

  summary.expense = String(Number(summary.expense) + value);
  summary.balance = String(Number(summary.balance) - value);
}

async function loadTransactionItems(
  records: TransactionRecordRow[],
  currentLedger: CurrentLedger,
) {
  const supabase = await createClient();
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return [] as TransactionListItem[];
  }

  const { data: itemData, error: itemError } = await supabase
    .from("transaction_item")
    .select("transaction_record_id, account_id, category_id, amount, note")
    .eq("ledger_id", currentLedger.id)
    .in("transaction_record_id", recordIds);

  if (itemError) {
    throw new Error("Failed to load transaction items");
  }

  const items = (itemData ?? []) as TransactionItemRow[];
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

  const [accountResult, categoryResult, merchantResult, recorderResult] =
    await Promise.all([
      accountIds.length > 0
        ? supabase
            .from("account")
            .select("id, name, currency")
            .eq("ledger_id", currentLedger.id)
            .in("id", accountIds)
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
      recorderIds.length > 0
        ? supabase
            .from("app_user")
            .select("id, display_name")
            .in("id", recorderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (accountResult.error) {
    throw new Error("Failed to load transaction accounts");
  }

  if (categoryResult.error) {
    throw new Error("Failed to load transaction categories");
  }

  if (merchantResult.error) {
    throw new Error("Failed to load transaction merchants");
  }

  if (recorderResult.error) {
    throw new Error("Failed to load transaction recorders");
  }

  const accounts = (accountResult.data ?? []) as AccountRow[];
  const categories = (categoryResult.data ?? []) as CategoryRow[];
  const merchants = (merchantResult.data ?? []) as MerchantRow[];
  const recorders = (recorderResult.data ?? []) as AppUserRow[];

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

  const itemsByRecordId = new Map<string, TransactionItemRow[]>();
  for (const item of items) {
    const arr = itemsByRecordId.get(item.transaction_record_id) ?? [];
    arr.push(item);
    itemsByRecordId.set(item.transaction_record_id, arr);
  }

  return records.map((record) => {
    const recordItems = itemsByRecordId.get(record.id) ?? [];
    const firstItem = recordItems[0];
    const account = firstItem
      ? accountById.get(firstItem.account_id)
      : undefined;
    const merchant = record.merchant_id
      ? merchantById.get(record.merchant_id)
      : undefined;
    const recorder = record.created_by
      ? recorderById.get(record.created_by)
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
      account_currency: account?.currency ?? "",
      account_name: account?.name ?? "未知账户",
      amount: String(totalAmount),
      categoryItems,
      created_at: record.created_at,
      id: record.id,
      merchant_icon_url: merchant?.icon_url ?? null,
      merchant_name: merchant?.name ?? null,
      note: record.note ?? firstItem?.note ?? null,
      recorder_name: recorder?.display_name ?? null,
      transaction_at: record.transaction_at,
      type: record.type,
    };
  });
}

function groupItems(
  items: TransactionListItem[],
  currency: string,
): TransactionDateGroup[] {
  const groupByDate = new Map<string, TransactionDateGroup>();

  for (const item of items) {
    const dateKey = formatDateKey(item.transaction_at);
    const group = groupByDate.get(dateKey) ?? {
      date: dateKey,
      items: [],
      label: formatDateLabel(dateKey),
      summary: createSummary(currency),
    };

    group.items.push(item);
    addAmount(group.summary, item.type, item.amount);
    groupByDate.set(dateKey, group);
  }

  return [...groupByDate.values()];
}

export async function loadTransactionMonthView(
  month?: string | null,
): Promise<TransactionMonthView> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const normalizedMonth = normalizeMonth(month);
  const { startIso, endIso } = getMonthBounds(normalizedMonth);

  // Load all records for summary calculation
  const { data: allRecordData, error: allRecordError } = await supabase
    .from("transaction_record")
    .select(
      "id, type, transaction_at, merchant_id, note, created_by, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active")
    .in("type", ["expense", "income"])
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (allRecordError) {
    throw new Error("Failed to load transaction records");
  }

  const allRecords = (allRecordData ?? []) as TransactionRecordRow[];
  const pageRecords = allRecords.slice(0, monthPageSize);
  const hasMore = allRecords.length > monthPageSize;

  const allItems = await loadTransactionItems(allRecords, currentLedger);

  const currency = currentLedger.baseCurrency;
  const monthSummary = createSummary(currency);

  for (const item of allItems) {
    addAmount(monthSummary, item.type, item.amount);
  }

  const displayItems = allItems.slice(0, pageRecords.length);

  return {
    groups: groupItems(displayItems, currency),
    month: normalizedMonth,
    monthLabel: formatMonthLabel(normalizedMonth),
    nextMonth: shiftMonth(normalizedMonth, 1),
    previousMonth: shiftMonth(normalizedMonth, -1),
    summary: monthSummary,
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
    .in("type", ["expense", "income"])
    .gte("transaction_at", startIso)
    .lt("transaction_at", endIso)
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(safeOffset, safeOffset + monthPageSize);

  if (recordError) {
    throw new Error("Failed to load transaction records");
  }

  const fetched = (recordData ?? []) as TransactionRecordRow[];
  const records = fetched.slice(0, monthPageSize);
  const hasMore = fetched.length > monthPageSize;
  const items = await loadTransactionItems(records, currentLedger);
  const currency = currentLedger.baseCurrency;

  return {
    groups: groupItems(items, currency),
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
    .in("type", ["expense", "income"])
    .order("transaction_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(safeOffset, safeOffset + transactionListPageSize);

  if (recordError) {
    throw new Error("Failed to load transaction records");
  }

  const fetchedRecords = (recordData ?? []) as TransactionRecordRow[];
  const records = fetchedRecords.slice(0, transactionListPageSize);
  const hasNextPage = fetchedRecords.length > transactionListPageSize;

  return {
    items: await loadTransactionItems(records, currentLedger),
    nextOffset: hasNextPage ? safeOffset + transactionListPageSize : null,
  };
}
