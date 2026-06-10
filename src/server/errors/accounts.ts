export const accountErrorCodes = {
  accountInvalid: "account_invalid",
  archiveFailed: "archive_failed",
  createFailed: "create_failed",
  currencyInvalid: "currency_invalid",
  holderInvalid: "holder_invalid",
  initialBalanceInvalid: "initial_balance_invalid",
  nameRequired: "name_required",
  typeInvalid: "type_invalid",
  updateFailed: "update_failed",
} as const;

export type AccountErrorCode =
  (typeof accountErrorCodes)[keyof typeof accountErrorCodes];

export type AccountValidationErrorCode =
  | typeof accountErrorCodes.accountInvalid
  | typeof accountErrorCodes.currencyInvalid
  | typeof accountErrorCodes.holderInvalid
  | typeof accountErrorCodes.initialBalanceInvalid
  | typeof accountErrorCodes.nameRequired
  | typeof accountErrorCodes.typeInvalid;

export type AccountServiceErrorCode =
  | typeof accountErrorCodes.archiveFailed
  | typeof accountErrorCodes.createFailed
  | typeof accountErrorCodes.updateFailed;
