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
  merchantId: string | null;
  note: string | null;
  transactionAt: string;
  type: TransactionType;
};

export type CreateTransactionItemParams = {
  amount: number;
  categoryId: string;
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
    p_items: params.items.map((item) => ({
      amount: item.amount,
      categoryId: item.categoryId,
    })),
    p_ledger_id: params.ledgerId,
    p_merchant_id: params.merchantId,
    p_note: params.note,
    p_transaction_at: params.transactionAt,
    p_type: params.type,
  });

  if (error) {
    return { ok: false, error: transactionErrorCodes.createFailed };
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
