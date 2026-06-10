import {
  merchantErrorCodes,
  type MerchantValidationErrorCode,
} from "server/errors/merchants";
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

export type { MerchantValidationErrorCode };

const merchantNameMaxLength = 100;
const textMaxLength = 1000;
const aliasMaxLength = 100;

export type CreateMerchantValues = {
  name: string;
  note: string | null;
  siteUrl: string | null;
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
): ValidationResult<
  string,
  typeof merchantErrorCodes.nameRequired | typeof merchantErrorCodes.nameTooLong
> {
  return parseTextField(formData, "name", {
    maxLength: merchantNameMaxLength,
    maxLengthError: merchantErrorCodes.nameTooLong,
    requiredError: merchantErrorCodes.nameRequired,
  });
}

function parseMerchantSiteUrl(
  formData: FormData,
): ValidationResult<
  string | null,
  typeof merchantErrorCodes.websiteUrlInvalid
> {
  const siteUrl = parseWebsiteUrl(getFormText(formData, "websiteUrl"));

  return siteUrl === undefined
    ? invalid(merchantErrorCodes.websiteUrlInvalid)
    : valid(siteUrl ?? null);
}

function parseMerchantNote(
  formData: FormData,
): ValidationResult<string | null, typeof merchantErrorCodes.noteTooLong> {
  return parseOptionalTextField(
    formData,
    "note",
    textMaxLength,
    merchantErrorCodes.noteTooLong,
  );
}

function parseMerchantValues(
  formData: FormData,
): ValidationResult<CreateMerchantValues, MerchantValidationErrorCode> {
  const nameResult = parseMerchantName(formData);

  if (!nameResult.ok) {
    return nameResult;
  }

  const siteUrlResult = parseMerchantSiteUrl(formData);

  if (!siteUrlResult.ok) {
    return siteUrlResult;
  }

  const noteResult = parseMerchantNote(formData);

  if (!noteResult.ok) {
    return noteResult;
  }

  return valid({
    name: nameResult.value,
    note: noteResult.value,
    siteUrl: siteUrlResult.value,
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
    merchantErrorCodes.merchantInvalid,
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
): ValidationResult<
  ArchiveMerchantValues,
  typeof merchantErrorCodes.merchantInvalid
> {
  const merchantIdResult = parseRequiredUuidField(
    formData,
    "merchantId",
    merchantErrorCodes.merchantInvalid,
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
    merchantErrorCodes.merchantInvalid,
  );

  if (!merchantIdResult.ok) {
    return merchantIdResult;
  }

  const aliasResult = parseTextField(formData, "alias", {
    maxLength: aliasMaxLength,
    maxLengthError: merchantErrorCodes.aliasTooLong,
    requiredError: merchantErrorCodes.aliasRequired,
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
): ValidationResult<
  ArchiveMerchantAliasValues,
  typeof merchantErrorCodes.aliasInvalid
> {
  const aliasIdResult = parseRequiredUuidField(
    formData,
    "aliasId",
    merchantErrorCodes.aliasInvalid,
  );

  if (!aliasIdResult.ok) {
    return aliasIdResult;
  }

  return valid({ aliasId: aliasIdResult.value });
}
