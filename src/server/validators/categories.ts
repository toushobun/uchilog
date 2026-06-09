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

export type CategoryValidationErrorCode =
  | "category_invalid"
  | "name_required"
  | "name_too_long"
  | "parent_invalid"
  | "type_invalid";

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
): ValidationResult<string, "name_required" | "name_too_long"> {
  return parseTextField(formData, "name", {
    maxLength: categoryNameMaxLength,
    maxLengthError: "name_too_long",
    requiredError: "name_required",
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
    "type_invalid",
  );

  if (!typeResult.ok) {
    return typeResult;
  }

  const parentIdResult = parseOptionalUuidText(
    getFormText(formData, "parentId"),
    "parent_invalid",
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
    "category_invalid",
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
): ValidationResult<ArchiveCategoryValues, "category_invalid"> {
  const categoryIdResult = parseRequiredUuidField(
    formData,
    "categoryId",
    "category_invalid",
  );

  if (!categoryIdResult.ok) {
    return categoryIdResult;
  }

  return valid({ categoryId: categoryIdResult.value });
}
