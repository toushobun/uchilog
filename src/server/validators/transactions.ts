import { maxTransactionTagCount } from "@/constants/transactions";
import {
  transactionErrorCodes,
  type TransactionValidationErrorCode,
  type UpdateTransactionValidationErrorCode,
  type VoidTransactionValidationErrorCode,
} from "server/errors/transactions";
import {
  transactionTypeOptions,
  type TransactionRecordType,
  type TransactionType,
} from "types/transactions";
import { getFormText } from "utils/formData";
import { isTransactionTagNameTooLong } from "utils/transactionTagRules";

import {
  invalid,
  parseEnumValue,
  parseMoneyAmount,
  parseOptionalTextField,
  parseOptionalUuidText,
  parseRequiredUuidField,
  type ValidationResult,
  valid,
} from "./common";

export type { TransactionValidationErrorCode };

const transactionTypeValues = transactionTypeOptions.map(
  (option) => option.value,
);
const createTransactionTypeValues = [
  ...transactionTypeValues,
  "transfer",
] as const;
const transactionRecordTypeValues = ["expense", "income", "transfer"] as const;

export type TransactionFormValues = {
  type: TransactionType;
  transactionAt: string;
  accountId: string;
  items: TransactionFormItemValues[];
  merchantId: string;
  note: string | null;
  tagNames: string[];
};

export type TransferTransactionFormValues = {
  type: "transfer";
  transactionAt: string;
  accountId: string;
  transferTargetAccountId: string;
  transferAmount: number;
  note: string | null;
};

export type CreateTransactionFormValues =
  | TransactionFormValues
  | TransferTransactionFormValues;

export type TransactionFormItemValues = {
  amount: number;
  categoryId: string;
};

export type UpdateTransactionValues = TransactionFormValues & {
  transactionRecordId: string;
};

export type UpdateTransferTransactionValues = TransferTransactionFormValues & {
  transactionRecordId: string;
};

export type ConvertTransactionToTransferValues =
  TransferTransactionFormValues & {
    sourceType: TransactionRecordType;
    targetType: "transfer";
    transactionRecordId: string;
  };

export type ConvertTransactionToNormalValues = TransactionFormValues & {
  sourceType: TransactionRecordType;
  targetType: TransactionType;
  transactionRecordId: string;
};

export type ConvertTransactionTypeValues =
  | ConvertTransactionToTransferValues
  | ConvertTransactionToNormalValues;

export type VoidTransactionValues = {
  transactionRecordId: string;
};

function parseTimeZoneOffsetMinutes(value: string) {
  if (!/^-?\d+$/.test(value)) {
    return null;
  }

  const offset = Number(value);

  if (!Number.isInteger(offset) || offset < -840 || offset > 840) {
    return null;
  }

  return offset;
}

function parseTransactionAt(value: string, offsetMinutes: number) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? "0");

  const utcLikeDate = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second),
  );

  if (
    utcLikeDate.getUTCFullYear() !== year ||
    utcLikeDate.getUTCMonth() !== month - 1 ||
    utcLikeDate.getUTCDate() !== day ||
    utcLikeDate.getUTCHours() !== hour ||
    utcLikeDate.getUTCMinutes() !== minute ||
    utcLikeDate.getUTCSeconds() !== second
  ) {
    return null;
  }

  return new Date(
    utcLikeDate.getTime() + offsetMinutes * 60 * 1000,
  ).toISOString();
}

function parseTransactionItems(
  formData: FormData,
): ValidationResult<
  TransactionFormItemValues[],
  TransactionValidationErrorCode
> {
  const categoryValues = formData.getAll("itemCategoryId");
  const amountValues = formData.getAll("itemAmount");

  if (
    categoryValues.length === 0 ||
    categoryValues.length !== amountValues.length
  ) {
    return invalid(transactionErrorCodes.amountInvalid);
  }

  const items: TransactionFormItemValues[] = [];

  for (const [index, categoryValue] of categoryValues.entries()) {
    const categoryResult = parseOptionalUuidText(
      String(categoryValue).trim(),
      transactionErrorCodes.categoryInvalid,
    );

    if (!categoryResult.ok || !categoryResult.value) {
      return invalid(transactionErrorCodes.categoryInvalid);
    }

    const amountResult = parseMoneyAmount(amountValues[index], {
      allowNegative: false,
      allowZero: true,
      error: transactionErrorCodes.amountInvalid,
    });

    if (!amountResult.ok) {
      return amountResult;
    }

    items.push({
      amount: amountResult.value,
      categoryId: categoryResult.value,
    });
  }

  return valid(items);
}

function parseTransactionTagNames(
  formData: FormData,
): ValidationResult<string[], TransactionValidationErrorCode> {
  const tagNames: string[] = [];

  for (const value of formData.getAll("tagName")) {
    const tagName = String(value).trim();

    if (!tagName) continue;

    if (isTransactionTagNameTooLong(tagName)) {
      return invalid(transactionErrorCodes.tagInvalid);
    }

    if (
      !tagNames.some(
        (currentName) => currentName.toLowerCase() === tagName.toLowerCase(),
      )
    ) {
      if (tagNames.length >= maxTransactionTagCount) {
        return invalid(transactionErrorCodes.tagInvalid);
      }

      tagNames.push(tagName);
    }
  }

  return valid(tagNames);
}

export function validateTransactionForm(
  formData: FormData,
): ValidationResult<
  CreateTransactionFormValues,
  TransactionValidationErrorCode
> {
  const typeResult = parseEnumValue(
    getFormText(formData, "type"),
    createTransactionTypeValues,
    transactionErrorCodes.typeInvalid,
  );

  if (!typeResult.ok) {
    return typeResult;
  }

  const offsetMinutes = parseTimeZoneOffsetMinutes(
    getFormText(formData, "timeZoneOffsetMinutes"),
  );

  if (offsetMinutes === null) {
    return invalid(transactionErrorCodes.dateInvalid);
  }

  const transactionAt = parseTransactionAt(
    getFormText(formData, "transactionAt"),
    offsetMinutes,
  );

  if (!transactionAt) {
    return invalid(transactionErrorCodes.dateInvalid);
  }

  const accountIdResult = parseRequiredUuidField(
    formData,
    "accountId",
    transactionErrorCodes.accountInvalid,
  );

  if (!accountIdResult.ok) {
    return accountIdResult;
  }

  if (typeResult.value === "transfer") {
    const targetAccountIdResult = parseRequiredUuidField(
      formData,
      "transferTargetAccountId",
      transactionErrorCodes.accountInvalid,
    );

    if (!targetAccountIdResult.ok) {
      return targetAccountIdResult;
    }

    if (targetAccountIdResult.value === accountIdResult.value) {
      return invalid(transactionErrorCodes.accountInvalid);
    }

    const transferAmountResult = parseMoneyAmount(
      formData.get("transferAmount"),
      {
        allowNegative: false,
        allowZero: false,
        error: transactionErrorCodes.amountInvalid,
      },
    );

    if (!transferAmountResult.ok) {
      return transferAmountResult;
    }

    const noteResult = parseOptionalTextField(
      formData,
      "note",
      2000,
      transactionErrorCodes.noteTooLong,
    );

    if (!noteResult.ok) {
      return noteResult;
    }

    return valid({
      accountId: accountIdResult.value,
      note: noteResult.value,
      transactionAt,
      transferAmount: transferAmountResult.value,
      transferTargetAccountId: targetAccountIdResult.value,
      type: "transfer",
    });
  }

  const itemsResult = parseTransactionItems(formData);

  if (!itemsResult.ok) {
    return itemsResult;
  }

  const merchantIdResult = parseRequiredUuidField(
    formData,
    "merchantId",
    transactionErrorCodes.merchantInvalid,
  );

  if (!merchantIdResult.ok) {
    return merchantIdResult;
  }

  const noteResult = parseOptionalTextField(
    formData,
    "note",
    2000,
    transactionErrorCodes.noteTooLong,
  );

  if (!noteResult.ok) {
    return noteResult;
  }

  const tagNamesResult = parseTransactionTagNames(formData);

  if (!tagNamesResult.ok) {
    return tagNamesResult;
  }

  return valid({
    accountId: accountIdResult.value,
    items: itemsResult.value,
    merchantId: merchantIdResult.value,
    note: noteResult.value,
    tagNames: tagNamesResult.value,
    transactionAt,
    type: typeResult.value,
  });
}

export function validateUpdateTransactionForm(
  formData: FormData,
): ValidationResult<
  UpdateTransactionValues,
  UpdateTransactionValidationErrorCode
> {
  const transactionRecordIdResult = parseRequiredUuidField(
    formData,
    "transactionRecordId",
    transactionErrorCodes.updateInvalid,
  );

  if (!transactionRecordIdResult.ok) {
    return transactionRecordIdResult;
  }

  if (String(formData.get("type") ?? "").trim() === "transfer") {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  const transactionResult = validateTransactionForm(formData);

  if (!transactionResult.ok) {
    return transactionResult;
  }

  // raw type=transfer 已提前拒绝；这里保留用于将 validateTransactionForm 的 union 返回值缩窄为普通交易。
  if (transactionResult.value.type === "transfer") {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  return valid({
    ...transactionResult.value,
    transactionRecordId: transactionRecordIdResult.value,
  });
}

export function validateUpdateTransferTransactionForm(
  formData: FormData,
): ValidationResult<
  UpdateTransferTransactionValues,
  UpdateTransactionValidationErrorCode
> {
  const transactionRecordIdResult = parseRequiredUuidField(
    formData,
    "transactionRecordId",
    transactionErrorCodes.updateInvalid,
  );

  if (!transactionRecordIdResult.ok) {
    return transactionRecordIdResult;
  }

  if (String(formData.get("type") ?? "").trim() !== "transfer") {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  const formResult = validateTransactionForm(formData);

  if (!formResult.ok) {
    return formResult;
  }

  // 已确认 type=transfer，这里用于收窄 union 类型。
  if (formResult.value.type !== "transfer") {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  return valid({
    ...formResult.value,
    transactionRecordId: transactionRecordIdResult.value,
  });
}

export function validateConvertTransactionTypeForm(
  formData: FormData,
): ValidationResult<
  ConvertTransactionTypeValues,
  UpdateTransactionValidationErrorCode
> {
  const transactionRecordIdResult = parseRequiredUuidField(
    formData,
    "transactionRecordId",
    transactionErrorCodes.updateInvalid,
  );

  if (!transactionRecordIdResult.ok) {
    return transactionRecordIdResult;
  }

  const sourceTypeResult = parseEnumValue(
    getFormText(formData, "sourceType"),
    transactionRecordTypeValues,
    transactionErrorCodes.updateInvalid,
  );

  if (!sourceTypeResult.ok) {
    return sourceTypeResult;
  }

  const targetTypeResult = parseEnumValue(
    getFormText(formData, "targetType") || getFormText(formData, "type"),
    transactionRecordTypeValues,
    transactionErrorCodes.updateInvalid,
  );

  if (!targetTypeResult.ok) {
    return targetTypeResult;
  }

  if (sourceTypeResult.value === targetTypeResult.value) {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  const formResult = validateTransactionForm(formData);

  if (!formResult.ok) {
    return formResult;
  }

  if (targetTypeResult.value === "transfer") {
    if (formResult.value.type !== "transfer") {
      return invalid(transactionErrorCodes.updateInvalid);
    }

    return valid({
      ...formResult.value,
      sourceType: sourceTypeResult.value,
      targetType: "transfer",
      transactionRecordId: transactionRecordIdResult.value,
    });
  }

  if (formResult.value.type === "transfer") {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  if (formResult.value.type !== targetTypeResult.value) {
    return invalid(transactionErrorCodes.updateInvalid);
  }

  return valid({
    ...formResult.value,
    sourceType: sourceTypeResult.value,
    targetType: targetTypeResult.value,
    transactionRecordId: transactionRecordIdResult.value,
  });
}

export function validateVoidTransactionForm(
  formData: FormData,
): ValidationResult<VoidTransactionValues, VoidTransactionValidationErrorCode> {
  const transactionRecordIdResult = parseRequiredUuidField(
    formData,
    "transactionRecordId",
    transactionErrorCodes.voidInvalid,
  );

  if (!transactionRecordIdResult.ok) {
    return transactionRecordIdResult;
  }

  return valid({ transactionRecordId: transactionRecordIdResult.value });
}
