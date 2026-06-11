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
      .not("parent_id", "is", null)
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
  const categoryOptions = (
    (categoryResult.data ?? []) as CategoryOptionDbRow[]
  ).map((category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
  }));
  const merchantOptions = (merchantResult.data ??
    []) as TransactionMerchantOption[];

  return {
    accountOptions,
    categoryOptions,
    ledgerName: currentLedger.name,
    merchantOptions,
  };
}
