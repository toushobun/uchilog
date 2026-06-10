"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { merchantsErrorHref, routePaths } from "config/paths";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  archiveMerchantAliasService,
  archiveMerchantService,
  createMerchantAliasService,
  createMerchantService,
  updateMerchantService,
} from "server/services/merchants";
import {
  validateArchiveMerchantAliasForm,
  validateArchiveMerchantForm,
  validateCreateMerchantAliasForm,
  validateCreateMerchantForm,
  validateUpdateMerchantForm,
} from "server/validators/merchants";

export async function createMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateCreateMerchantForm(formData);

  if (!validation.ok) {
    redirect(merchantsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await createMerchantService({
    ledgerId: currentLedger.id,
    name: values.name,
    note: values.note,
    userId,
    siteUrl: values.siteUrl,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function updateMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateUpdateMerchantForm(formData);

  if (!validation.ok) {
    redirect(merchantsErrorHref(validation.error, validation.merchantId));
  }

  const values = validation.value;

  const result = await updateMerchantService({
    ledgerId: currentLedger.id,
    merchantId: values.merchantId,
    name: values.name,
    note: values.note,
    userId,
    siteUrl: values.siteUrl,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, values.merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function archiveMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateArchiveMerchantForm(formData);

  if (!validation.ok) {
    redirect(merchantsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await archiveMerchantService({
    ledgerId: currentLedger.id,
    merchantId: values.merchantId,
    userId,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, values.merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function createMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateCreateMerchantAliasForm(formData);

  if (!validation.ok) {
    redirect(merchantsErrorHref(validation.error, validation.merchantId));
  }

  const values = validation.value;

  const result = await createMerchantAliasService({
    alias: values.alias,
    ledgerId: currentLedger.id,
    merchantId: values.merchantId,
    userId,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, values.merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function archiveMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateArchiveMerchantAliasForm(formData);

  if (!validation.ok) {
    redirect(merchantsErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await archiveMerchantAliasService({
    aliasId: values.aliasId,
    ledgerId: currentLedger.id,
    userId,
  });

  if (!result.ok) {
    redirect(merchantsErrorHref(result.error, result.merchantId ?? ""));
  }

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}
