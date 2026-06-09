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
import { getFormText, isUuid } from "utils/formData";
import { validateTransactionForm } from "utils/transactionValidation";

export async function createTransaction(formData: FormData) {
  const validation = validateTransactionForm(formData);

  if (!validation.ok) {
    redirect(newTransactionErrorHref(validation.error));
  }

  const { currentLedger } = await requireCurrentUserAndLedger();
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
  const transactionRecordId = getFormText(formData, "transactionRecordId");

  if (!isUuid(transactionRecordId)) {
    redirect(transactionsErrorHref("void_invalid"));
  }

  const { currentLedger } = await requireCurrentUserAndLedger();

  const result = await voidTransactionService({
    ledgerId: currentLedger.id,
    transactionRecordId,
  });

  if (!result.ok) redirect(transactionsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  redirect(routePaths.transactions);
}
