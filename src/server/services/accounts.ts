import { createClient } from "lib/supabase/server";
import type { ServiceResult } from "server/services/serviceResult";
import type { AccountType } from "types/accounts";

export type CreateAccountParams = {
  currency: string;
  holderUserIds: string[];
  initialBalance: number;
  ledgerId: string;
  name: string;
  type: AccountType;
};

export type UpdateAccountParams = {
  accountId: string;
  currency: string;
  holderUserIds: string[];
  ledgerId: string;
  name: string;
  type: AccountType;
};

export type ArchiveAccountParams = {
  accountId: string;
  ledgerId: string;
  userId: string;
};

export async function createAccountService(
  params: CreateAccountParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_account_with_holders", {
    p_currency: params.currency,
    p_holder_user_ids: params.holderUserIds,
    p_initial_balance: params.initialBalance,
    p_ledger_id: params.ledgerId,
    p_name: params.name,
    p_type: params.type,
  });

  if (error) {
    return { ok: false, error: "create_failed" };
  }

  return { ok: true };
}

export async function updateAccountService(
  params: UpdateAccountParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_account_with_holders", {
    p_account_id: params.accountId,
    p_currency: params.currency,
    p_holder_user_ids: params.holderUserIds,
    p_ledger_id: params.ledgerId,
    p_name: params.name,
    p_type: params.type,
  });

  if (error) {
    return { ok: false, error: "update_failed" };
  }

  return { ok: true };
}

export async function archiveAccountService(
  params: ArchiveAccountParams,
): Promise<ServiceResult> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("account")
    .update(
      {
        archived_at: new Date().toISOString(),
        archived_by: params.userId,
        is_archived: true,
        updated_by: params.userId,
      },
      { count: "exact" },
    )
    .eq("id", params.accountId)
    .eq("ledger_id", params.ledgerId)
    .eq("is_archived", false);

  if (error || count !== 1) {
    return { ok: false, error: "archive_failed" };
  }

  return { ok: true };
}
