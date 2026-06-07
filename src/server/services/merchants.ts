import { createClient } from "lib/supabase/server";

type ServiceOk = { ok: true };
type ServiceError = { ok: false; error: string };
type ServiceResult = ServiceOk | ServiceError;

export type CreateMerchantParams = {
  ledgerId: string;
  name: string;
  note: string | null;
  userId: string;
  websiteUrl: string | null;
};

export type UpdateMerchantParams = {
  ledgerId: string;
  merchantId: string;
  name: string;
  note: string | null;
  userId: string;
  websiteUrl: string | null;
};

export type ArchiveMerchantParams = {
  ledgerId: string;
  merchantId: string;
  userId: string;
};

export type CreateMerchantAliasParams = {
  alias: string;
  merchantId: string;
  userId: string;
};

export type ArchiveMerchantAliasParams = {
  aliasId: string;
  ledgerId: string;
  userId: string;
};

export async function createMerchantService(
  params: CreateMerchantParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("merchant").insert({
    ledger_id: params.ledgerId,
    name: params.name,
    website_url: params.websiteUrl,
    note: params.note,
    sort_order: 0,
    created_by: params.userId,
    updated_by: params.userId,
  });

  if (error) {
    return { ok: false, error: "create_failed" };
  }

  return { ok: true };
}

export async function updateMerchantService(
  params: UpdateMerchantParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        name: params.name,
        website_url: params.websiteUrl,
        note: params.note,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.merchantId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return { ok: false, error: "update_failed" };
  }

  return { ok: true };
}

export async function archiveMerchantService(
  params: ArchiveMerchantParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: params.userId,
        is_archived: true,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.merchantId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return { ok: false, error: "archive_failed" };
  }

  return { ok: true };
}

export async function createMerchantAliasService(
  params: CreateMerchantAliasParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("merchant_alias").insert({
    merchant_id: params.merchantId,
    alias: params.alias,
    sort_order: 0,
    created_by: params.userId,
    updated_by: params.userId,
  });

  if (error) {
    return { ok: false, error: "alias_create_failed" };
  }

  return { ok: true };
}

export async function archiveMerchantAliasService(
  params: ArchiveMerchantAliasParams,
): Promise<ServiceResult & { merchantId?: string }> {
  const supabase = await createClient();

  const { data: aliasRow, error: aliasError } = await supabase
    .from("merchant_alias")
    .select("id, merchant_id")
    .eq("id", params.aliasId)
    .eq("is_archived", false)
    .maybeSingle();

  if (aliasError || !aliasRow) {
    return { ok: false, error: "alias_invalid" };
  }

  // 确认商家属于当前账本
  const { data: merchantRow, error: merchantError } = await supabase
    .from("merchant")
    .select("id")
    .eq("id", aliasRow.merchant_id)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false)
    .maybeSingle();

  if (merchantError || !merchantRow) {
    return { ok: false, error: "alias_invalid" };
  }

  const { error, count } = await supabase
    .from("merchant_alias")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: params.userId,
        is_archived: true,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.aliasId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return {
      ok: false,
      error: "alias_archive_failed",
      merchantId: aliasRow.merchant_id,
    };
  }

  return { ok: true, merchantId: aliasRow.merchant_id };
}
