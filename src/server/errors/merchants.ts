export const merchantErrorCodes = {
  aliasArchiveFailed: "alias_archive_failed",
  aliasCreateFailed: "alias_create_failed",
  aliasInvalid: "alias_invalid",
  aliasRequired: "alias_required",
  aliasTooLong: "alias_too_long",
  archiveFailed: "archive_failed",
  createFailed: "create_failed",
  merchantInvalid: "merchant_invalid",
  nameRequired: "name_required",
  nameTooLong: "name_too_long",
  noteTooLong: "note_too_long",
  updateFailed: "update_failed",
  websiteUrlInvalid: "website_url_invalid",
} as const;

export type MerchantErrorCode =
  (typeof merchantErrorCodes)[keyof typeof merchantErrorCodes];

export type MerchantValidationErrorCode =
  | typeof merchantErrorCodes.aliasInvalid
  | typeof merchantErrorCodes.aliasRequired
  | typeof merchantErrorCodes.aliasTooLong
  | typeof merchantErrorCodes.merchantInvalid
  | typeof merchantErrorCodes.nameRequired
  | typeof merchantErrorCodes.nameTooLong
  | typeof merchantErrorCodes.noteTooLong
  | typeof merchantErrorCodes.websiteUrlInvalid;

export type MerchantServiceErrorCode =
  | typeof merchantErrorCodes.aliasArchiveFailed
  | typeof merchantErrorCodes.aliasCreateFailed
  | typeof merchantErrorCodes.aliasInvalid
  | typeof merchantErrorCodes.archiveFailed
  | typeof merchantErrorCodes.createFailed
  | typeof merchantErrorCodes.merchantInvalid
  | typeof merchantErrorCodes.updateFailed;
