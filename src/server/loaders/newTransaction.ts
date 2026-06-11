import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";
import type { CategoryOptionDbRow } from "server/db-types";
import type {
  TransactionAccountOption,
  TransactionMerchantOption,
} from "types/transactions";

export async function loadNewTransactionView() {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();

  const [accountResult, categoryResult, merchantResult] = await Promise.all([
    supabase
      .from("account")
      .select("id, name, currency")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("category")
      .select("id, name, type, parent_id")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("merchant")
      .select("id, name, icon_url")
      .eq("ledger_id", currentLedger.id)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (accountResult.error) {
    throw new Error("Failed to load transaction account options");
  }

  if (categoryResult.error) {
    throw new Error("Failed to load transaction category options");
  }

  if (merchantResult.error) {
    throw new Error("Failed to load transaction merchant options");
  }

  const accountOptions = (accountResult.data ??
    []) as TransactionAccountOption[];
  const categoryRows = (categoryResult.data ?? []) as CategoryOptionDbRow[];
  const categoryOptions = buildCategoryOptions(categoryRows);
  const merchantOptions = (merchantResult.data ??
    []) as TransactionMerchantOption[];

  return {
    accountOptions,
    categoryOptions,
    ledgerName: currentLedger.name,
    merchantOptions,
  };
}

export function buildCategoryOptions(rows: CategoryOptionDbRow[]) {
  const parentNameById = new Map(
    rows
      .filter((row) => row.parent_id === null)
      .map((row) => [row.id, row.name]),
  );
  return rows
    .filter((row) => row.parent_id !== null)
    .map((row) => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      parentName: parentNameById.get(row.parent_id!) ?? null,
      type: row.type,
    }));
}
