export const categoryErrorCodes = {
  archiveFailed: "archive_failed",
  categoryInvalid: "category_invalid",
  createFailed: "create_failed",
  nameRequired: "name_required",
  nameTooLong: "name_too_long",
  parentInvalid: "parent_invalid",
  typeInvalid: "type_invalid",
  updateFailed: "update_failed",
} as const;

export type CategoryErrorCode =
  (typeof categoryErrorCodes)[keyof typeof categoryErrorCodes];

export type CategoryValidationErrorCode =
  | typeof categoryErrorCodes.categoryInvalid
  | typeof categoryErrorCodes.nameRequired
  | typeof categoryErrorCodes.nameTooLong
  | typeof categoryErrorCodes.parentInvalid
  | typeof categoryErrorCodes.typeInvalid;

export type CategoryServiceErrorCode =
  | typeof categoryErrorCodes.archiveFailed
  | typeof categoryErrorCodes.createFailed
  | typeof categoryErrorCodes.parentInvalid
  | typeof categoryErrorCodes.updateFailed;
