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
import { getFormText, isUuid, parseOptionalText } from "utils/formData";
import { parseWebsiteUrl } from "utils/merchants";

const merchantNameMaxLength = 100;
const textMaxLength = 1000;
const aliasMaxLength = 100;

export async function createMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const name = getFormText(formData, "name");
  const websiteUrl = parseWebsiteUrl(getFormText(formData, "websiteUrl"));
  const note = parseOptionalText(getFormText(formData, "note"), textMaxLength);

  if (name.length === 0) redirect(merchantsErrorHref("name_required"));
  if (name.length > merchantNameMaxLength)
    redirect(merchantsErrorHref("name_too_long"));
  if (websiteUrl === undefined)
    redirect(merchantsErrorHref("website_url_invalid"));
  if (!note.ok) redirect(merchantsErrorHref("note_too_long"));

  const result = await createMerchantService({
    ledgerId: currentLedger.id,
    name,
    note: note.value,
    userId,
    websiteUrl: websiteUrl ?? null,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function updateMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const merchantId = getFormText(formData, "merchantId");
  const name = getFormText(formData, "name");
  const websiteUrl = parseWebsiteUrl(getFormText(formData, "websiteUrl"));
  const note = parseOptionalText(getFormText(formData, "note"), textMaxLength);

  if (!isUuid(merchantId)) redirect(merchantsErrorHref("merchant_invalid"));
  if (name.length === 0)
    redirect(merchantsErrorHref("name_required", merchantId));
  if (name.length > merchantNameMaxLength)
    redirect(merchantsErrorHref("name_too_long", merchantId));
  if (websiteUrl === undefined)
    redirect(merchantsErrorHref("website_url_invalid", merchantId));
  if (!note.ok) redirect(merchantsErrorHref("note_too_long", merchantId));

  const result = await updateMerchantService({
    ledgerId: currentLedger.id,
    merchantId,
    name,
    note: note.value,
    userId,
    websiteUrl: websiteUrl ?? null,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function archiveMerchant(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const merchantId = getFormText(formData, "merchantId");

  if (!isUuid(merchantId)) redirect(merchantsErrorHref("merchant_invalid"));

  const result = await archiveMerchantService({
    ledgerId: currentLedger.id,
    merchantId,
    userId,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function createMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const merchantId = getFormText(formData, "merchantId");
  const alias = getFormText(formData, "alias");

  if (!isUuid(merchantId)) redirect(merchantsErrorHref("merchant_invalid"));
  if (alias.length === 0)
    redirect(merchantsErrorHref("alias_required", merchantId));
  if (alias.length > aliasMaxLength)
    redirect(merchantsErrorHref("alias_too_long", merchantId));

  const result = await createMerchantAliasService({
    alias,
    ledgerId: currentLedger.id,
    merchantId,
    userId,
  });

  if (!result.ok) redirect(merchantsErrorHref(result.error, merchantId));

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}

export async function archiveMerchantAlias(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const aliasId = getFormText(formData, "aliasId");

  if (!isUuid(aliasId)) redirect(merchantsErrorHref("alias_invalid"));

  const result = await archiveMerchantAliasService({
    aliasId,
    ledgerId: currentLedger.id,
    userId,
  });

  if (!result.ok) {
    redirect(merchantsErrorHref(result.error, result.merchantId ?? ""));
  }

  revalidatePath(routePaths.merchants);
  redirect(routePaths.merchants);
}
