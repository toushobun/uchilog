"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  editTransactionErrorHref,
  newTransactionErrorHref,
  routePaths,
  transactionEditPagePath,
  transactionsErrorHref,
  transactionsMonthHref,
} from "config/paths";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  createTransactionService,
  updateTransactionService,
  voidTransactionService,
} from "server/services/transactions";
import {
  validateTransactionForm,
  validateUpdateTransactionForm,
  validateVoidTransactionForm,
} from "server/validators/transactions";

function transactionMonthRedirectHref(transactionAt: string) {
  return transactionsMonthHref(transactionAt.slice(0, 7));
}

export async function createTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateTransactionForm(formData);

  if (!validation.ok) {
    redirect(newTransactionErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await createTransactionService({
    accountId: values.accountId,
    items: values.items,
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
  redirect(transactionMonthRedirectHref(values.transactionAt));
}

export async function updateTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateUpdateTransactionForm(formData);
  const rawTransactionRecordId = String(
    formData.get("transactionRecordId") ?? "",
  ).trim();

  if (!validation.ok) {
    redirect(
      rawTransactionRecordId
        ? editTransactionErrorHref(rawTransactionRecordId, validation.error)
        : transactionsErrorHref(validation.error),
    );
  }

  const values = validation.value;

  const result = await updateTransactionService({
    accountId: values.accountId,
    items: values.items,
    ledgerId: currentLedger.id,
    merchantId: values.merchantId,
    note: values.note,
    transactionAt: values.transactionAt,
    transactionRecordId: values.transactionRecordId,
    type: values.type,
  });

  if (!result.ok) {
    redirect(
      editTransactionErrorHref(values.transactionRecordId, result.error),
    );
  }

  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  revalidatePath(transactionEditPagePath, "page");
  redirect(transactionMonthRedirectHref(values.transactionAt));
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
