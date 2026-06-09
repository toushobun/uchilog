import { createClient } from "lib/supabase/server";
import type { ServiceResult } from "server/services/serviceResult";
import type { TransactionType } from "types/transactions";

export type CreateCategoryParams = {
  ledgerId: string;
  name: string;
  parentId: string | null;
  type: TransactionType;
  userId: string;
};

export type UpdateCategoryParams = {
  categoryId: string;
  ledgerId: string;
  name: string;
  userId: string;
};

export type ArchiveCategoryParams = {
  categoryId: string;
  ledgerId: string;
  userId: string;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function loadNextSortOrder(
  supabase: SupabaseClient,
  params: {
    ledgerId: string;
    parentId: string | null;
    type: TransactionType;
  },
) {
  let query = supabase
    .from("category")
    .select("sort_order")
    .eq("ledger_id", params.ledgerId)
    .eq("type", params.type)
    .eq("is_archived", false)
    .order("sort_order", { ascending: false })
    .limit(1);

  query =
    params.parentId === null
      ? query.is("parent_id", null)
      : query.eq("parent_id", params.parentId);

  const { data, error } = await query;

  if (error) {
    return null;
  }

  const maxSortOrder = Number(data?.[0]?.sort_order ?? 0);

  return Number.isFinite(maxSortOrder) ? maxSortOrder + 10 : 10;
}

export async function createCategoryService(
  params: CreateCategoryParams,
): Promise<ServiceResult> {
  const supabase = await createClient();

  if (params.parentId !== null) {
    const { data, error } = await supabase
      .from("category")
      .select("id")
      .eq("id", params.parentId)
      .eq("ledger_id", params.ledgerId)
      .eq("type", params.type)
      .eq("is_archived", false)
      .is("parent_id", null)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, error: "parent_invalid" };
    }
  }

  const sortOrder = await loadNextSortOrder(supabase, params);

  if (sortOrder === null) {
    return { ok: false, error: "create_failed" };
  }

  const { error } = await supabase.from("category").insert({
    created_by: params.userId,
    ledger_id: params.ledgerId,
    name: params.name,
    parent_id: params.parentId,
    sort_order: sortOrder,
    type: params.type,
    updated_by: params.userId,
  });

  if (error) {
    return { ok: false, error: "create_failed" };
  }

  return { ok: true };
}

export async function updateCategoryService(
  params: UpdateCategoryParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("category")
    .update(
      {
        name: params.name,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.categoryId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return { ok: false, error: "update_failed" };
  }

  return { ok: true };
}

export async function archiveCategoryService(
  params: ArchiveCategoryParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase
    .from("category")
    .select("id, parent_id")
    .eq("id", params.categoryId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false)
    .maybeSingle();

  if (categoryError || !category) {
    return { ok: false, error: "archive_failed" };
  }

  let query = supabase
    .from("category")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: params.userId,
        is_archived: true,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  query =
    category.parent_id === null
      ? query.or(`id.eq.${params.categoryId},parent_id.eq.${params.categoryId}`)
      : query.eq("id", params.categoryId);

  const { error, count } = await query;

  if (error || !count) {
    return { ok: false, error: "archive_failed" };
  }

  return { ok: true };
}
