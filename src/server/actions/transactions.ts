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
import { isUuid } from "utils/formData";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  convertTransactionTypeService,
  createTransactionService,
  createTransferTransactionService,
  updateTransactionService,
  updateTransferTransactionService,
  voidTransactionService,
} from "server/services/transactions";
import {
  validateConvertTransactionTypeForm,
  validateTransactionForm,
  validateUpdateTransactionForm,
  validateUpdateTransferTransactionForm,
  validateVoidTransactionForm,
} from "server/validators/transactions";

function transactionMonthRedirectHref(transactionAt: string) {
  return transactionsMonthHref(transactionAt.slice(0, 7));
}

function isRawTransferType(formData: FormData) {
  return String(formData.get("type") ?? "").trim() === "transfer";
}

function newTransactionValidationErrorHref(error: string, formData: FormData) {
  return newTransactionErrorHref(
    error,
    isRawTransferType(formData) ? "transfer" : null,
  );
}

function rawTransactionRecordId(formData: FormData) {
  return String(formData.get("transactionRecordId") ?? "").trim();
}

function rawTargetType(formData: FormData) {
  return String(formData.get("targetType") ?? formData.get("type") ?? "").trim();
}

function isTransactionRecordType(value: string) {
  return value === "expense" || value === "income" || value === "transfer";
}

function revalidateEditTransactionPaths() {
  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  revalidatePath(transactionEditPagePath, "page");
}

export async function createTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateTransactionForm(formData);

  if (!validation.ok) {
    redirect(newTransactionValidationErrorHref(validation.error, formData));
  }

  const values = validation.value;
  const result =
    values.type === "transfer"
      ? await createTransferTransactionService({
          accountId: values.accountId,
          ledgerId: currentLedger.id,
          note: values.note,
          transactionAt: values.transactionAt,
          transferAmount: values.transferAmount,
          transferTargetAccountId: values.transferTargetAccountId,
        })
      : await createTransactionService({
          accountId: values.accountId,
          items: values.items,
          ledgerId: currentLedger.id,
          merchantId: values.merchantId,
          note: values.note,
          tagNames: values.tagNames,
          transactionAt: values.transactionAt,
          type: values.type,
        });

  if (!result.ok) {
    redirect(
      newTransactionErrorHref(
        result.error,
        values.type === "transfer" ? values.type : null,
      ),
    );
  }

  revalidatePath(routePaths.accounts);
  revalidatePath(routePaths.transactions);
  revalidatePath(routePaths.transactionsNew);
  redirect(transactionMonthRedirectHref(values.transactionAt));
}

export async function updateTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateUpdateTransactionForm(formData);
  const transactionRecordId = rawTransactionRecordId(formData);

  if (!validation.ok) {
    redirect(
      transactionRecordId
        ? editTransactionErrorHref(transactionRecordId, validation.error)
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
    tagNames: values.tagNames,
    transactionAt: values.transactionAt,
    transactionRecordId: values.transactionRecordId,
    type: values.type,
  });

  if (!result.ok) {
    redirect(
      editTransactionErrorHref(values.transactionRecordId, result.error),
    );
  }

  revalidateEditTransactionPaths();
  redirect(transactionMonthRedirectHref(values.transactionAt));
}

export async function updateTransferTransaction(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateUpdateTransferTransactionForm(formData);
  const transactionRecordId = rawTransactionRecordId(formData);

  if (!validation.ok) {
    redirect(
      isUuid(transactionRecordId)
        ? editTransactionErrorHref(transactionRecordId, validation.error)
        : transactionsErrorHref(validation.error),
    );
  }

  const values = validation.value;

  const result = await updateTransferTransactionService({
    accountId: values.accountId,
    ledgerId: currentLedger.id,
    note: values.note,
    transactionAt: values.transactionAt,
    transactionRecordId: values.transactionRecordId,
    transferAmount: values.transferAmount,
    transferTargetAccountId: values.transferTargetAccountId,
  });

  if (!result.ok) {
    redirect(
      editTransactionErrorHref(values.transactionRecordId, result.error),
    );
  }

  revalidateEditTransactionPaths();
  redirect(transactionMonthRedirectHref(values.transactionAt));
}

export async function convertTransactionType(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateConvertTransactionTypeForm(formData);
  const transactionRecordId = rawTransactionRecordId(formData);

  if (!validation.ok) {
    redirect(
      isUuid(transactionRecordId)
        ? editTransactionErrorHref(transactionRecordId, validation.error)
        : transactionsErrorHref(validation.error),
    );
  }

  const values = validation.value;
  const result =
    values.targetType === "transfer"
      ? await convertTransactionTypeService({
          accountId: values.accountId,
          ledgerId: currentLedger.id,
          note: values.note,
          targetType: "transfer",
          transactionAt: values.transactionAt,
          transactionRecordId: values.transactionRecordId,
          transferAmount: values.transferAmount,
          transferTargetAccountId: values.transferTargetAccountId,
        })
      : await convertTransactionTypeService({
          accountId: values.accountId,
          items: values.items,
          ledgerId: currentLedger.id,
          merchantId: values.merchantId,
          note: values.note,
          tagNames: values.tagNames,
          targetType: values.targetType,
          transactionAt: values.transactionAt,
          transactionRecordId: values.transactionRecordId,
        });

  if (!result.ok) {
    redirect(
      editTransactionErrorHref(values.transactionRecordId, result.error),
    );
  }

  revalidateEditTransactionPaths();
  redirect(transactionMonthRedirectHref(values.transactionAt));
}

export async function saveEditTransaction(formData: FormData) {
  const sourceType = String(formData.get("sourceType") ?? "").trim();
  const targetType = rawTargetType(formData);

  if (
    !isTransactionRecordType(sourceType) ||
    !isTransactionRecordType(targetType)
  ) {
    const transactionRecordId = rawTransactionRecordId(formData);
    redirect(
      isUuid(transactionRecordId)
        ? editTransactionErrorHref(transactionRecordId, "update_invalid")
        : transactionsErrorHref("update_invalid"),
    );
  }

  if (sourceType === targetType) {
    if (targetType === "transfer") {
      return updateTransferTransaction(formData);
    }

    return updateTransaction(formData);
  }

  if (sourceType !== "transfer" && targetType !== "transfer") {
    return updateTransaction(formData);
  }

  return convertTransactionType(formData);
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
