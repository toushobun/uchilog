"use server";

import {
  createTransaction as createTransactionCore,
  updateTransaction as updateTransactionCore,
  updateTransferTransaction as updateTransferTransactionCore,
  voidTransaction as voidTransactionCore,
} from "./transactionActionsCore";

export async function createTransaction(formData: FormData) {
  return createTransactionCore(formData);
}

export async function updateTransaction(formData: FormData) {
  return updateTransactionCore(formData);
}

export async function updateTransferTransaction(formData: FormData) {
  return updateTransferTransactionCore(formData);
}

export async function voidTransaction(formData: FormData) {
  return voidTransactionCore(formData);
}
