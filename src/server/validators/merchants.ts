import { getFormText } from "utils/formData";
import { parseWebsiteUrl } from "utils/merchants";

import {
  invalid,
  parseOptionalTextField,
  parseRequiredUuidField,
  parseTextField,
  type ValidationResult,
  valid,
} from "./common";

const merchantNameMaxLength = 100;
const textMaxLength = 1000;
const aliasMaxLength = 100;

export type CreateMerchantValues = {
  name: string;
  note: string | null;
  websiteUrl: string | null;
};

export type UpdateMerchantValues = CreateMerchantValues & {
  merchantId: string;
};

export type ArchiveMerchantValues = {
  merchantId: string;
};

export type CreateMerchantAliasValues = {
  alias: string;
  merchantId: string;
};

export type ArchiveMerchantAliasValues = {
  aliasId: string;
};

export type MerchantValidationErrorCode =
  | "alias_invalid"
  | "alias_required"
  | "alias_too_long"
  | "merchant_invalid"
  | "name_required"
  | "name_too_long"
  | "note_too_long"
  | "website_url_invalid";

type MerchantFormFailure = {
  error: MerchantValidationErrorCode;
  merchantId?: string;
  ok: false;
};

type MerchantFormResult<T> = { ok: true; value: T } | MerchantFormFailure;

function invalidWithMerchantId(
  error: MerchantValidationErrorCode,
  merchantId: string,
): MerchantFormFailure {
  return merchantId.length > 0
    ? { error, merchantId, ok: false }
    : { error, ok: false };
}

function parseMerchantName(
  formData: FormData,
): ValidationResult<string, "name_required" | "name_too_long"> {
  return parseTextField(formData, "name", {
    maxLength: merchantNameMaxLength,
    maxLengthError: "name_too_long",
    requiredError: "name_required",
  });
}

function parseMerchantWebsiteUrl(
  formData: FormData,
): ValidationResult<string | null, "website_url_invalid"> {
  const websiteUrl = parseWebsiteUrl(getFormText(formData, "websiteUrl"));

  return websiteUrl === undefined
    ? invalid("website_url_invalid")
    : valid(websiteUrl ?? null);
}

function parseMerchantNote(
  formData: FormData,
): ValidationResult<string | null, "note_too_long"> {
  return parseOptionalTextField(
    formData,
    "note",
    textMaxLength,
    "note_too_long",
  );
}

function parseMerchantValues(
  formData: FormData,
): ValidationResult<
  CreateMerchantValues,
  "name_required" | "name_too_long" | "note_too_long" | "website_url_invalid"
> {
  const nameResult = parseMerchantName(formData);

  if (!nameResult.ok) {
    return nameResult;
  }

  const websiteUrlResult = parseMerchantWebsiteUrl(formData);

  if (!websiteUrlResult.ok) {
    return websiteUrlResult;
  }

  const noteResult = parseMerchantNote(formData);

  if (!noteResult.ok) {
    return noteResult;
  }

  return valid({
    name: nameResult.value,
    note: noteResult.value,
    websiteUrl: websiteUrlResult.value,
  });
}

export function validateCreateMerchantForm(
  formData: FormData,
): ValidationResult<CreateMerchantValues, MerchantValidationErrorCode> {
  return parseMerchantValues(formData);
}

export function validateUpdateMerchantForm(
  formData: FormData,
): MerchantFormResult<UpdateMerchantValues> {
  const merchantIdText = getFormText(formData, "merchantId");
  const merchantIdResult = parseRequiredUuidField(
    formData,
    "merchantId",
    "merchant_invalid",
  );

  if (!merchantIdResult.ok) {
    return merchantIdResult;
  }

  const merchantValuesResult = parseMerchantValues(formData);

  if (!merchantValuesResult.ok) {
    return invalidWithMerchantId(merchantValuesResult.error, merchantIdText);
  }

  return valid({
    merchantId: merchantIdResult.value,
    ...merchantValuesResult.value,
  });
}

export function validateArchiveMerchantForm(
  formData: FormData,
): ValidationResult<ArchiveMerchantValues, "merchant_invalid"> {
  const merchantIdResult = parseRequiredUuidField(
    formData,
    "merchantId",
    "merchant_invalid",
  );

  if (!merchantIdResult.ok) {
    return merchantIdResult;
  }

  return valid({ merchantId: merchantIdResult.value });
}

export function validateCreateMerchantAliasForm(
  formData: FormData,
): MerchantFormResult<CreateMerchantAliasValues> {
  const merchantIdText = getFormText(formData, "merchantId");
  const merchantIdResult = parseRequiredUuidField(
    formData,
    "merchantId",
    "merchant_invalid",
  );

  if (!merchantIdResult.ok) {
    return merchantIdResult;
  }

  const aliasResult = parseTextField(formData, "alias", {
    maxLength: aliasMaxLength,
    maxLengthError: "alias_too_long",
    requiredError: "alias_required",
  });

  if (!aliasResult.ok) {
    return invalidWithMerchantId(aliasResult.error, merchantIdText);
  }

  return valid({
    alias: aliasResult.value,
    merchantId: merchantIdResult.value,
  });
}

export function validateArchiveMerchantAliasForm(
  formData: FormData,
): ValidationResult<ArchiveMerchantAliasValues, "alias_invalid"> {
  const aliasIdResult = parseRequiredUuidField(
    formData,
    "aliasId",
    "alias_invalid",
  );

  if (!aliasIdResult.ok) {
    return aliasIdResult;
  }

  return valid({ aliasId: aliasIdResult.value });
}
