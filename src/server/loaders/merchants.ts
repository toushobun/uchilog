"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type { MerchantAliasRow, MerchantRow } from "types/merchants";
import { attachAliases, filterMerchantsByKeyword } from "utils/merchants";

export type MerchantsView = {
  ledgerName: string;
  merchants: MerchantRow[];
};

export async function loadMerchantsView(
  keyword: string,
): Promise<MerchantsView> {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const supabase = await createClient();

  const { data: merchantData, error: merchantError } = await supabase
    .from("merchant")
    .select("id, name, website_url, icon_url, note, sort_order, created_at")
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (merchantError) {
    throw new Error("Failed to load merchants");
  }

  const merchantsWithoutAliases = (merchantData ?? []).map((merchant) => ({
    ...merchant,
    aliases: [],
  })) as MerchantRow[];
  const merchantIds = merchantsWithoutAliases.map((merchant) => merchant.id);
  const { data: aliasData, error: aliasError } = merchantIds.length
    ? await supabase
        .from("merchant_alias")
        .select("id, merchant_id, alias, sort_order, created_at")
        .in("merchant_id", merchantIds)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (aliasError) {
    throw new Error("Failed to load merchant aliases");
  }

  return {
    ledgerName: currentLedger.name,
    merchants: filterMerchantsByKeyword(
      attachAliases(
        merchantsWithoutAliases,
        (aliasData ?? []) as MerchantAliasRow[],
      ),
      keyword,
    ),
  };
}
