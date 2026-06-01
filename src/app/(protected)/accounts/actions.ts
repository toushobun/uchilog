"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

import { accountTypeOptions, type AccountType } from "./types";

const accountTypeValues = accountTypeOptions.map((option) => option.value);

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseAccountType(value: string): AccountType | null {
  if (accountTypeValues.includes(value as AccountType)) {
    return value as AccountType;
  }

  return null;
}

function parseCurrency(value: string, fallbackCurrency: string) {
  const currency = (value || fallbackCurrency).trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    return null;
  }

  return currency;
}

function parseNumber(value: FormDataEntryValue | null, fallback: number) {
  const text = String(value ?? "").trim();

  if (text.length === 0) {
    return fallback;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    return null;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

async function getCurrentUserAndLedger() {
  const context = await getCurrentLedgerContext();

  if (!context.currentLedger) {
    redirect("/ledger-setup");
  }

  // getCurrentLedgerContext reads ledger_member for the current user and only returns active ledgers.
  // Later update/archive queries also filter by currentLedger.id, so client-submitted ledger_id is not trusted.
  return {
    currentLedger: context.currentLedger,
    userId: context.userId,
  };
}

export async function createAccount(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const name = getText(formData, "name");
  const type = parseAccountType(getText(formData, "type"));
  const currency = parseCurrency(
    getText(formData, "currency"),
    currentLedger.baseCurrency,
  );
  const initialBalance = parseNumber(formData.get("initialBalance"), 0);

  if (name.length === 0) {
    redirect("/accounts?error=name_required");
  }

  if (!type) {
    redirect("/accounts?error=type_invalid");
  }

  if (!currency) {
    redirect("/accounts?error=currency_invalid");
  }

  if (initialBalance === null) {
    redirect("/accounts?error=initial_balance_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("account").insert({
    ledger_id: currentLedger.id,
    name,
    type,
    currency,
    initial_balance: initialBalance,
    sort_order: 0,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    redirect("/accounts?error=create_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function updateAccount(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const accountId = getText(formData, "accountId");
  const name = getText(formData, "name");
  const type = parseAccountType(getText(formData, "type"));
  const currency = parseCurrency(
    getText(formData, "currency"),
    currentLedger.baseCurrency,
  );

  if (accountId.length === 0) {
    redirect("/accounts?error=account_required");
  }

  if (name.length === 0) {
    redirect("/accounts?error=name_required");
  }

  if (!type) {
    redirect("/accounts?error=type_invalid");
  }

  if (!currency) {
    redirect("/accounts?error=currency_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("account")
    .update({
      name,
      type,
      currency,
      updated_by: userId,
    })
    .eq("id", accountId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error) {
    redirect("/accounts?error=update_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function archiveAccount(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const accountId = getText(formData, "accountId");

  if (accountId.length === 0) {
    redirect("/accounts?error=account_required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("account")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: userId,
      is_archived: true,
      updated_by: userId,
    })
    .eq("id", accountId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error) {
    redirect("/accounts?error=archive_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}
