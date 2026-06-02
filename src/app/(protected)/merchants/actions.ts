"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseOptionalText(value: string, maxLength: number) {
  if (value.length === 0) {
    return null;
  }

  if (value.length > maxLength) {
    return undefined;
  }

  return value;
}

function parseWebsiteUrl(value: string) {
  if (value.length === 0) {
    return null;
  }

  if (!/^https?:\/\//.test(value)) {
    return undefined;
  }

  return value;
}

function parseLocale(value: string) {
  if (value.length === 0) {
    return null;
  }

  if (value.length < 2 || value.length > 20) {
    return undefined;
  }

  return value;
}

async function getCurrentUserAndLedger() {
  const context = await getCurrentLedgerContext();

  if (!context.currentLedger) {
    redirect("/ledger-setup");
  }

  return {
    currentLedger: context.currentLedger,
    userId: context.userId,
  };
}

async function ensureMerchantInCurrentLedger(merchantId: string, ledgerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merchant")
    .select("id")
    .eq("id", merchantId)
    .eq("ledger_id", ledgerId)
    .eq("is_archived", false)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

export async function createMerchant(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const name = getText(formData, "name");
  const websiteUrl = parseWebsiteUrl(getText(formData, "websiteUrl"));
  const note = parseOptionalText(getText(formData, "note"), 1000);

  if (name.length === 0) {
    redirect("/merchants?error=name_required");
  }

  if (websiteUrl === undefined) {
    redirect("/merchants?error=website_url_invalid");
  }

  if (note === undefined) {
    redirect("/merchants?error=note_too_long");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merchant").insert({
    ledger_id: currentLedger.id,
    name,
    website_url: websiteUrl,
    note,
    sort_order: 0,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    redirect("/merchants?error=create_failed");
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}

export async function updateMerchant(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const merchantId = getText(formData, "merchantId");
  const name = getText(formData, "name");
  const websiteUrl = parseWebsiteUrl(getText(formData, "websiteUrl"));
  const note = parseOptionalText(getText(formData, "note"), 1000);

  if (!isUuid(merchantId)) {
    redirect("/merchants?error=merchant_invalid");
  }

  if (name.length === 0) {
    redirect("/merchants?error=name_required");
  }

  if (websiteUrl === undefined) {
    redirect("/merchants?error=website_url_invalid");
  }

  if (note === undefined) {
    redirect("/merchants?error=note_too_long");
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        name,
        website_url: websiteUrl,
        note,
        updated_by: userId,
      },
      { count: "exact" },
    )
    .eq("id", merchantId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error || count !== 1) {
    redirect("/merchants?error=update_failed");
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}

export async function archiveMerchant(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const merchantId = getText(formData, "merchantId");

  if (!isUuid(merchantId)) {
    redirect("/merchants?error=merchant_invalid");
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        is_archived: true,
        updated_by: userId,
      },
      { count: "exact" },
    )
    .eq("id", merchantId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error || count !== 1) {
    redirect("/merchants?error=archive_failed");
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}

export async function createMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const merchantId = getText(formData, "merchantId");
  const alias = getText(formData, "alias");
  const locale = parseLocale(getText(formData, "locale"));

  if (!isUuid(merchantId)) {
    redirect("/merchants?error=merchant_invalid");
  }

  if (alias.length === 0) {
    redirect("/merchants?error=alias_required");
  }

  if (alias.length > 100) {
    redirect("/merchants?error=alias_too_long");
  }

  if (locale === undefined) {
    redirect("/merchants?error=locale_invalid");
  }

  if (!(await ensureMerchantInCurrentLedger(merchantId, currentLedger.id))) {
    redirect("/merchants?error=merchant_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merchant_alias").insert({
    merchant_id: merchantId,
    alias,
    locale,
    sort_order: 0,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    redirect("/merchants?error=alias_create_failed");
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}

export async function archiveMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const aliasId = getText(formData, "aliasId");

  if (!isUuid(aliasId)) {
    redirect("/merchants?error=alias_invalid");
  }

  const supabase = await createClient();
  const { data: aliasRow, error: aliasError } = await supabase
    .from("merchant_alias")
    .select("id, merchant_id")
    .eq("id", aliasId)
    .eq("is_archived", false)
    .maybeSingle();

  if (aliasError || !aliasRow) {
    redirect("/merchants?error=alias_invalid");
  }

  if (!(await ensureMerchantInCurrentLedger(aliasRow.merchant_id, currentLedger.id))) {
    redirect("/merchants?error=alias_invalid");
  }

  const { error, count } = await supabase
    .from("merchant_alias")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        is_archived: true,
        updated_by: userId,
      },
      { count: "exact" },
    )
    .eq("id", aliasId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    redirect("/merchants?error=alias_archive_failed");
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}
