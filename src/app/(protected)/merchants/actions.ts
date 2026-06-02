"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const merchantNameMaxLength = 100;
const textMaxLength = 1000;
const aliasMaxLength = 100;

type OptionalTextResult = { ok: true; value: string | null } | { ok: false };

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectMerchantError(error: string, merchantId: string): never {
  redirect(`/merchants?error=${error}&merchantId=${merchantId}`);
}

function parseOptionalText(
  value: string,
  maxLength: number,
): OptionalTextResult {
  if (value.length === 0) {
    return { ok: true, value: null };
  }

  if (value.length > maxLength) {
    return { ok: false };
  }

  return { ok: true, value };
}

function parseWebsiteUrl(value: string) {
  if (value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      return undefined;
    }

    return value;
  } catch {
    return undefined;
  }
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

async function ensureMerchantInCurrentLedger(
  merchantId: string,
  ledgerId: string,
) {
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
  const note = parseOptionalText(getText(formData, "note"), textMaxLength);

  if (name.length === 0) {
    redirect("/merchants?error=name_required");
  }

  if (name.length > merchantNameMaxLength) {
    redirect("/merchants?error=name_too_long");
  }

  if (websiteUrl === undefined) {
    redirect("/merchants?error=website_url_invalid");
  }

  if (!note.ok) {
    redirect("/merchants?error=note_too_long");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merchant").insert({
    ledger_id: currentLedger.id,
    name,
    website_url: websiteUrl,
    note: note.value,
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
  const note = parseOptionalText(getText(formData, "note"), textMaxLength);

  if (!isUuid(merchantId)) {
    redirect("/merchants?error=merchant_invalid");
  }

  if (name.length === 0) {
    redirectMerchantError("name_required", merchantId);
  }

  if (name.length > merchantNameMaxLength) {
    redirectMerchantError("name_too_long", merchantId);
  }

  if (websiteUrl === undefined) {
    redirectMerchantError("website_url_invalid", merchantId);
  }

  if (!note.ok) {
    redirectMerchantError("note_too_long", merchantId);
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        name,
        website_url: websiteUrl,
        note: note.value,
        updated_by: userId,
      },
      { count: "exact" },
    )
    .eq("id", merchantId)
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false);

  if (error || count !== 1) {
    redirectMerchantError("update_failed", merchantId);
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
    redirectMerchantError("archive_failed", merchantId);
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}

export async function createMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const merchantId = getText(formData, "merchantId");
  const alias = getText(formData, "alias");

  if (!isUuid(merchantId)) {
    redirect("/merchants?error=merchant_invalid");
  }

  if (alias.length === 0) {
    redirectMerchantError("alias_required", merchantId);
  }

  if (alias.length > aliasMaxLength) {
    redirectMerchantError("alias_too_long", merchantId);
  }

  if (!(await ensureMerchantInCurrentLedger(merchantId, currentLedger.id))) {
    redirect("/merchants?error=merchant_invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("merchant_alias").insert({
    merchant_id: merchantId,
    alias,
    sort_order: 0,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    redirectMerchantError("alias_create_failed", merchantId);
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

  if (
    !(await ensureMerchantInCurrentLedger(
      aliasRow.merchant_id,
      currentLedger.id,
    ))
  ) {
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
    redirectMerchantError("alias_archive_failed", aliasRow.merchant_id);
  }

  revalidatePath("/merchants");
  redirect("/merchants");
}
