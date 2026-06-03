"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

import { accountTypeOptions, type AccountType } from "./types";

const accountTypeValues = accountTypeOptions.map((option) => option.value);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseAccountType(value: string): AccountType | null {
  if (accountTypeValues.includes(value as AccountType)) {
    return value as AccountType;
  }

  return null;
}

function parseCurrency(value: string) {
  const currency = value.trim().toUpperCase();

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

function parseHolderUserIds(formData: FormData) {
  const holderUserIds = formData
    .getAll("holderUserIds")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  const uniqueHolderUserIds = [...new Set(holderUserIds)];

  return uniqueHolderUserIds.every(isUuid) ? uniqueHolderUserIds : null;
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
  const { currentLedger } = await getCurrentUserAndLedger();
  const name = getText(formData, "name");
  const type = parseAccountType(getText(formData, "type"));
  const currency = parseCurrency(getText(formData, "currency"));
  const initialBalance = parseNumber(formData.get("initialBalance"), 0);
  const holderUserIds = parseHolderUserIds(formData);

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

  if (!holderUserIds) {
    redirect("/accounts?error=holder_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_account_with_holders", {
    p_currency: currency,
    p_holder_user_ids: holderUserIds,
    p_initial_balance: initialBalance,
    p_ledger_id: currentLedger.id,
    p_name: name,
    p_type: type,
  });

  if (error) {
    redirect("/accounts?error=create_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function updateAccount(formData: FormData) {
  const { currentLedger } = await getCurrentUserAndLedger();
  const accountId = getText(formData, "accountId");
  const name = getText(formData, "name");
  const type = parseAccountType(getText(formData, "type"));
  const currency = parseCurrency(getText(formData, "currency"));
  const holderUserIds = parseHolderUserIds(formData);

  if (!isUuid(accountId)) {
    redirect("/accounts?error=account_invalid");
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

  if (!holderUserIds) {
    redirect("/accounts?error=holder_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_account_with_holders", {
    p_account_id: accountId,
    p_currency: currency,
    p_holder_user_ids: holderUserIds,
    p_ledger_id: currentLedger.id,
    p_name: name,
    p_type: type,
  });

  if (error) {
    redirect("/accounts?error=update_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function archiveAccount(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const accountId = getText(formData, "accountId");

  if (!isUuid(accountId)) {
    redirect("/accounts?error=account_invalid");
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("account")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        is_archived: true,
        updated_by: userId,
      },
      { count: "exact" },
    )
    .eq("id", accountId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error || count !== 1) {
    redirect("/accounts?error=archive_failed");
  }

  revalidatePath("/accounts");
  redirect("/accounts");
}
