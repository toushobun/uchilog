"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { accountsErrorHref, routePaths } from "config/paths";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  archiveAccountService,
  createAccountService,
  updateAccountService,
} from "server/services/accounts";
import {
  validateArchiveAccountForm,
  validateCreateAccountForm,
  validateUpdateAccountForm,
} from "server/validators/accounts";

export async function createAccount(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateCreateAccountForm(formData);

  if (!validation.ok) {
    redirect(accountsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await createAccountService({
    currency: values.currency,
    holderUserIds: values.holderUserIds,
    initialBalance: values.initialBalance,
    ledgerId: currentLedger.id,
    name: values.name,
    type: values.type,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}

export async function updateAccount(formData: FormData) {
  const { currentLedger } = await requireCurrentUserAndLedger();
  const validation = validateUpdateAccountForm(formData);

  if (!validation.ok) {
    redirect(accountsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await updateAccountService({
    accountId: values.accountId,
    currency: values.currency,
    holderUserIds: values.holderUserIds,
    ledgerId: currentLedger.id,
    name: values.name,
    type: values.type,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}

export async function archiveAccount(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateArchiveAccountForm(formData);

  if (!validation.ok) {
    redirect(accountsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await archiveAccountService({
    accountId: values.accountId,
    ledgerId: currentLedger.id,
    userId,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}
