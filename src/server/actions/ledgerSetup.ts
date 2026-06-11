"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";
import { ledgerSetupErrorHref, routePaths } from "config/paths";

export async function createLedger(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const baseCurrency = String(formData.get("baseCurrency") ?? "JPY")
    .trim()
    .toUpperCase();

  if (name.length === 0) {
    redirect(ledgerSetupErrorHref("name_required"));
  }

  if (!/^[A-Z]{3}$/.test(baseCurrency)) {
    redirect(ledgerSetupErrorHref("currency_invalid"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_ledger_with_owner", {
    p_name: name,
    p_base_currency: baseCurrency,
  });

  if (error) {
    redirect(ledgerSetupErrorHref("create_failed"));
  }

  revalidatePath("/", "layout");

  redirect(routePaths.dashboard);
}
