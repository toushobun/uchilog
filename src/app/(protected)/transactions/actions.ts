"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import { validateTransactionForm } from "./validation";

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

export async function createTransaction(formData: FormData) {
  const validation = validateTransactionForm(formData);

  if (!validation.ok) {
    redirect(`/transactions/new?error=${encodeURIComponent(validation.error)}`);
  }

  const { currentLedger } = await getCurrentUserAndLedger();
  const supabase = await createClient();
  const values = validation.value;

  const { error } = await supabase.rpc("create_transaction", {
    p_account_id: values.accountId,
    p_amount: values.amount,
    p_category_id: values.categoryId,
    p_ledger_id: currentLedger.id,
    p_merchant_id: values.merchantId,
    p_note: values.note,
    p_transaction_at: values.transactionAt,
    p_type: values.type,
  });

  if (error) {
    redirect("/transactions/new?error=create_failed");
  }

  revalidatePath("/transactions");
  revalidatePath("/transactions/new");
  redirect("/transactions");
}
