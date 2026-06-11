import {
  categoryErrorCodes,
  type CategoryValidationErrorCode,
} from "server/errors/categories";
import { categoryTypeOptions } from "types/categories";
import type { TransactionType } from "types/transactions";
import { getFormText } from "utils/formData";

import {
  parseEnumValue,
  parseOptionalUuidText,
  parseRequiredUuidField,
  parseTextField,
  type ValidationResult,
  valid,
} from "./common";

export type { CategoryValidationErrorCode };

const categoryTypeValues = categoryTypeOptions.map((option) => option.value);
const categoryNameMaxLength = 100;

export type CreateCategoryValues = {
  name: string;
  parentId: string | null;
  type: TransactionType;
};

export type UpdateCategoryValues = {
  categoryId: string;
  name: string;
};

export type ArchiveCategoryValues = {
  categoryId: string;
};

type CategoryFormFailure = {
  categoryId?: string;
  error: CategoryValidationErrorCode;
  ok: false;
};

type CategoryFormResult<T> = { ok: true; value: T } | CategoryFormFailure;

function invalidWithCategoryId(
  error: CategoryValidationErrorCode,
  categoryId: string,
): CategoryFormFailure {
  return categoryId.length > 0
    ? { categoryId, error, ok: false }
    : { error, ok: false };
}

function parseCategoryName(
  formData: FormData,
): ValidationResult<
  string,
  typeof categoryErrorCodes.nameRequired | typeof categoryErrorCodes.nameTooLong
> {
  return parseTextField(formData, "name", {
    maxLength: categoryNameMaxLength,
    maxLengthError: categoryErrorCodes.nameTooLong,
    requiredError: categoryErrorCodes.nameRequired,
  });
}

export function validateCreateCategoryForm(
  formData: FormData,
): ValidationResult<CreateCategoryValues, CategoryValidationErrorCode> {
  const nameResult = parseCategoryName(formData);

  if (!nameResult.ok) {
    return nameResult;
  }

  const typeResult = parseEnumValue(
    getFormText(formData, "type"),
    categoryTypeValues,
    categoryErrorCodes.typeInvalid,
  );

  if (!typeResult.ok) {
    return typeResult;
  }

  const parentIdResult = parseOptionalUuidText(
    getFormText(formData, "parentId"),
    categoryErrorCodes.parentInvalid,
  );

  if (!parentIdResult.ok) {
    return parentIdResult;
  }

  return valid({
    name: nameResult.value,
    parentId: parentIdResult.value,
    type: typeResult.value,
  });
}

export function validateUpdateCategoryForm(
  formData: FormData,
): CategoryFormResult<UpdateCategoryValues> {
  const categoryIdText = getFormText(formData, "categoryId");
  const categoryIdResult = parseRequiredUuidField(
    formData,
    "categoryId",
    categoryErrorCodes.categoryInvalid,
  );

  if (!categoryIdResult.ok) {
    return categoryIdResult;
  }

  const nameResult = parseCategoryName(formData);

  if (!nameResult.ok) {
    return invalidWithCategoryId(nameResult.error, categoryIdText);
  }

  return valid({ categoryId: categoryIdResult.value, name: nameResult.value });
}

export function validateArchiveCategoryForm(
  formData: FormData,
): ValidationResult<
  ArchiveCategoryValues,
  typeof categoryErrorCodes.categoryInvalid
> {
  const categoryIdResult = parseRequiredUuidField(
    formData,
    "categoryId",
    categoryErrorCodes.categoryInvalid,
  );

  if (!categoryIdResult.ok) {
    return categoryIdResult;
  }

  return valid({ categoryId: categoryIdResult.value });
}
