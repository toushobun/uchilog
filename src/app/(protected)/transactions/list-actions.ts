"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type { TransactionListItem, TransactionListPage } from "./types";

const transactionListPageSize = 20;

type TransactionRecordRow = {
  id: string;
  type: "expense" | "income";
  transaction_at: string;
  merchant_id: string | null;
  note: string | null;
  created_at: string;
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
};

type MerchantRow = {
  id: string;
  name: string;
  icon_url: string | null;
};

export async function loadTransactionListPage(
  offset = 0,
): Promise<TransactionListPage> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();
  const safeOffset = Math.max(0, offset);

  const { data: recordData, error: recordError } = await supabase
    .from("transaction_record")
    .select("id, type, transaction_at, merchant_id, note, created_at")
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
  const recordIds = records.map((record) => record.id);

  if (recordIds.length === 0) {
    return {
      items: [],
      nextOffset: null,
    };
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

  const [accountResult, categoryResult, merchantResult] = await Promise.all([
    accountIds.length > 0
      ? supabase
          .from("account")
          .select("id, name, currency")
          .eq("ledger_id", currentLedger.id)
          .in("id", accountIds)
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length > 0
      ? supabase
          .from("category")
          .select("id, name")
          .eq("ledger_id", currentLedger.id)
          .in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    merchantIds.length > 0
      ? supabase
          .from("merchant")
          .select("id, name, icon_url")
          .eq("ledger_id", currentLedger.id)
          .in("id", merchantIds)
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

  const accounts = (accountResult.data ?? []) as AccountRow[];
  const categories = (categoryResult.data ?? []) as CategoryRow[];
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
  // 当前只支持单明细。多明细场景需要改为 Map<string, TransactionItemRow[]> 并调整展示逻辑。
  const itemByRecordId = new Map(
    items.map((item) => [item.transaction_record_id, item] as const),
  );

  const transactionItems: TransactionListItem[] = records.map((record) => {
    const item = itemByRecordId.get(record.id);
    const account = item ? accountById.get(item.account_id) : undefined;
    const category = item?.category_id
      ? categoryById.get(item.category_id)
      : undefined;
    const merchant = record.merchant_id
      ? merchantById.get(record.merchant_id)
      : undefined;

    return {
      account_currency: account?.currency ?? "",
      account_name: account?.name ?? "未知账户",
      amount: item?.amount ?? "",
      category_name: category?.name ?? null,
      created_at: record.created_at,
      id: record.id,
      merchant_icon_url: merchant?.icon_url ?? null,
      merchant_name: merchant?.name ?? null,
      note: record.note ?? item?.note ?? null,
      transaction_at: record.transaction_at,
      type: record.type,
    };
  });

  return {
    items: transactionItems,
    nextOffset: hasNextPage ? safeOffset + transactionListPageSize : null,
  };
}
