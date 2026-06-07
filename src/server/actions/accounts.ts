"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "lib/ledger/current-ledger";
import { accountsErrorHref, routePaths } from "config/paths";
import {
  archiveAccountService,
  createAccountService,
  updateAccountService,
} from "server/services/accounts";
import { accountTypeOptions, type AccountType } from "types/accounts";
import { getFormText, isUuid } from "utils/formData";

const accountTypeValues = accountTypeOptions.map((option) => option.value);

function parseAccountType(value: string): AccountType | null {
  if (accountTypeValues.includes(value as AccountType)) {
    return value as AccountType;
  }

  return null;
}

function parseCurrency(value: string) {
  const currency = value.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    return null;
  }

  return currency;
}

function parseNumber(value: FormDataEntryValue | null, fallback: number) {
  const text = String(value ?? "").trim();

  if (text.length === 0) {
    return fallback;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    return null;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseHolderUserIds(formData: FormData) {
  const holderUserIds = formData
    .getAll("holderUserIds")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  const uniqueHolderUserIds = [...new Set(holderUserIds)];

  return uniqueHolderUserIds.every(isUuid) ? uniqueHolderUserIds : null;
}

async function getCurrentUserAndLedger() {
  const context = await getCurrentLedgerContext();

  if (!context.currentLedger) {
    redirect(routePaths.ledgerSetup);
  }

  return {
    currentLedger: context.currentLedger,
    userId: context.userId,
  };
}

export async function createAccount(formData: FormData) {
  const { currentLedger } = await getCurrentUserAndLedger();
  const name = getFormText(formData, "name");
  const type = parseAccountType(getFormText(formData, "type"));
  const currency = parseCurrency(getFormText(formData, "currency"));
  const initialBalance = parseNumber(formData.get("initialBalance"), 0);
  const holderUserIds = parseHolderUserIds(formData);

  if (name.length === 0) redirect(accountsErrorHref("name_required"));
  if (!type) redirect(accountsErrorHref("type_invalid"));
  if (!currency) redirect(accountsErrorHref("currency_invalid"));
  if (initialBalance === null)
    redirect(accountsErrorHref("initial_balance_invalid"));
  if (!holderUserIds) redirect(accountsErrorHref("holder_invalid"));

  const result = await createAccountService({
    currency: currency!,
    holderUserIds: holderUserIds!,
    initialBalance: initialBalance!,
    ledgerId: currentLedger.id,
    name,
    type: type!,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}

export async function updateAccount(formData: FormData) {
  const { currentLedger } = await getCurrentUserAndLedger();
  const accountId = getFormText(formData, "accountId");
  const name = getFormText(formData, "name");
  const type = parseAccountType(getFormText(formData, "type"));
  const currency = parseCurrency(getFormText(formData, "currency"));
  const holderUserIds = parseHolderUserIds(formData);

  if (!isUuid(accountId)) redirect(accountsErrorHref("account_invalid"));
  if (name.length === 0) redirect(accountsErrorHref("name_required"));
  if (!type) redirect(accountsErrorHref("type_invalid"));
  if (!currency) redirect(accountsErrorHref("currency_invalid"));
  if (!holderUserIds) redirect(accountsErrorHref("holder_invalid"));

  const result = await updateAccountService({
    accountId,
    currency: currency!,
    holderUserIds: holderUserIds!,
    ledgerId: currentLedger.id,
    name,
    type: type!,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}

export async function archiveAccount(formData: FormData) {
  const { currentLedger, userId } = await getCurrentUserAndLedger();
  const accountId = getFormText(formData, "accountId");

  if (!isUuid(accountId)) redirect(accountsErrorHref("account_invalid"));

  const result = await archiveAccountService({
    accountId,
    ledgerId: currentLedger.id,
    userId,
  });

  if (!result.ok) redirect(accountsErrorHref(result.error));

  revalidatePath(routePaths.accounts);
  redirect(routePaths.accounts);
}
