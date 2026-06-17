import { createClient } from "lib/supabase/server";
import {
  transactionErrorCodes,
  type TransactionServiceErrorCode,
} from "server/errors/transactions";
import type { ServiceResult } from "server/services/serviceResult";
import type { TransactionType } from "types/transactions";

export type CreateTransactionParams = {
  accountId: string;
  items: CreateTransactionItemParams[];
  ledgerId: string;
  merchantId: string;
  note: string | null;
  tagNames: string[];
  transactionAt: string;
  type: TransactionType;
};

export type CreateTransactionItemParams = {
  amount: number;
  categoryId: string;
};

export type UpdateTransactionParams = CreateTransactionParams & {
  transactionRecordId: string;
};

export type VoidTransactionParams = {
  ledgerId: string;
  transactionRecordId: string;
};

export async function createTransactionService(
  params: CreateTransactionParams,
): Promise<ServiceResult<TransactionServiceErrorCode>> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_transaction", {
    p_account_id: params.accountId,
    p_items: params.items,
    p_ledger_id: params.ledgerId,
    p_merchant_id: params.merchantId,
    p_note: params.note,
    p_tag_names: params.tagNames,
    p_transaction_at: params.transactionAt,
    p_type: params.type,
  });

  if (error) {
    return { ok: false, error: transactionErrorCodes.createFailed };
  }

  return { ok: true };
}

export async function updateTransactionService(
  params: UpdateTransactionParams,
): Promise<ServiceResult<TransactionServiceErrorCode>> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_transaction", {
    p_account_id: params.accountId,
    p_items: params.items,
    p_ledger_id: params.ledgerId,
    p_merchant_id: params.merchantId,
    p_note: params.note,
    p_tag_names: params.tagNames,
    p_transaction_at: params.transactionAt,
    p_transaction_record_id: params.transactionRecordId,
    p_type: params.type,
  });

  if (error) {
    return { ok: false, error: transactionErrorCodes.updateFailed };
  }

  return { ok: true };
}

export async function voidTransactionService(
  params: VoidTransactionParams,
): Promise<ServiceResult<TransactionServiceErrorCode>> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("void_transaction", {
    p_ledger_id: params.ledgerId,
    p_transaction_record_id: params.transactionRecordId,
  });

  if (error) {
    return { ok: false, error: transactionErrorCodes.voidFailed };
  }

  return { ok: true };
}
