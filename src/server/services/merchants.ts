import { createClient } from "lib/supabase/server";
import {
  merchantErrorCodes,
  type MerchantServiceErrorCode,
} from "server/errors/merchants";
import type { ServiceResult } from "server/services/serviceResult";

export type CreateMerchantParams = {
  ledgerId: string;
  name: string;
  note: string | null;
  userId: string;
  siteUrl: string | null;
};

export type UpdateMerchantParams = {
  ledgerId: string;
  merchantId: string;
  name: string;
  note: string | null;
  userId: string;
  siteUrl: string | null;
};

export type ArchiveMerchantParams = {
  ledgerId: string;
  merchantId: string;
  userId: string;
};

export type CreateMerchantAliasParams = {
  alias: string;
  ledgerId: string;
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
): Promise<ServiceResult<MerchantServiceErrorCode>> {
  const supabase = await createClient();
  const { error } = await supabase.from("merchant").insert({
    ledger_id: params.ledgerId,
    name: params.name,
    website_url: params.siteUrl,
    note: params.note,
    sort_order: 0,
    created_by: params.userId,
    updated_by: params.userId,
  });

  if (error) {
    return { ok: false, error: merchantErrorCodes.createFailed };
  }

  return { ok: true };
}

export async function updateMerchantService(
  params: UpdateMerchantParams,
): Promise<ServiceResult<MerchantServiceErrorCode>> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("merchant")
    .update(
      {
        name: params.name,
        website_url: params.siteUrl,
        note: params.note,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.merchantId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return { ok: false, error: merchantErrorCodes.updateFailed };
  }

  return { ok: true };
}

export async function archiveMerchantService(
  params: ArchiveMerchantParams,
): Promise<ServiceResult<MerchantServiceErrorCode>> {
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
    return { ok: false, error: merchantErrorCodes.archiveFailed };
  }

  return { ok: true };
}

export async function createMerchantAliasService(
  params: CreateMerchantAliasParams,
): Promise<ServiceResult<MerchantServiceErrorCode>> {
  const supabase = await createClient();

  const { data: merchant, error: merchantError } = await supabase
    .from("merchant")
    .select("id")
    .eq("id", params.merchantId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false)
    .maybeSingle();

  if (merchantError || !merchant) {
    return { ok: false, error: merchantErrorCodes.merchantInvalid };
  }

  const { error } = await supabase.from("merchant_alias").insert({
    merchant_id: params.merchantId,
    alias: params.alias,
    sort_order: 0,
    created_by: params.userId,
    updated_by: params.userId,
  });

  if (error) {
    return { ok: false, error: merchantErrorCodes.aliasCreateFailed };
  }

  return { ok: true };
}

export async function archiveMerchantAliasService(
  params: ArchiveMerchantAliasParams,
): Promise<ServiceResult<MerchantServiceErrorCode> & { merchantId?: string }> {
  const supabase = await createClient();

  const { data: aliasRow, error: aliasError } = await supabase
    .from("merchant_alias")
    .select("id, merchant_id")
    .eq("id", params.aliasId)
    .eq("is_archived", false)
    .maybeSingle();

  if (aliasError || !aliasRow) {
    return { ok: false, error: merchantErrorCodes.aliasInvalid };
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
    return { ok: false, error: merchantErrorCodes.aliasInvalid };
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
      error: merchantErrorCodes.aliasArchiveFailed,
      merchantId: aliasRow.merchant_id,
    };
  }

  return { ok: true, merchantId: aliasRow.merchant_id };
}
