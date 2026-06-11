"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  newTransactionErrorHref,
  routePaths,
  transactionsErrorHref,
} from "config/paths";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  createTransactionService,
  voidTransactionService,
} from "server/services/transactions";
import {
  validateTransactionForm,
  validateVoidTransactionForm,
} from "server/validators/transactions";

export async function createTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateTransactionForm(formData);

  if (!validation.ok) {
    redirect(newTransactionErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await createTransactionService({
    accountId: values.accountId,
    amount: values.amount,
    categoryId: values.categoryId,
    ledgerId: currentLedger.id,
    merchantId: values.merchantId,
    note: values.note,
    transactionAt: values.transactionAt,
    type: values.type,
  });

  if (!result.ok) redirect(newTransactionErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  revalidatePath(routePaths.transactionsNew);
  redirect(routePaths.transactions);
}

export async function voidTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateVoidTransactionForm(formData);

  if (!validation.ok) {
    redirect(transactionsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await voidTransactionService({
    ledgerId: currentLedger.id,
    transactionRecordId: values.transactionRecordId,
  });

  if (!result.ok) redirect(transactionsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  redirect(routePaths.transactions);
}
