import {
  transactionErrorCodes,
  type TransactionValidationErrorCode,
  type VoidTransactionValidationErrorCode,
} from "server/errors/transactions";
import {
  transactionTypeOptions,
  type TransactionType,
} from "types/transactions";
import { getFormText } from "utils/formData";

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

export type TransactionFormValues = {
  type: TransactionType;
  transactionAt: string;
  accountId: string;
  items: TransactionFormItemValues[];
  merchantId: string | null;
  note: string | null;
};

export type TransactionFormItemValues = {
  amount: number;
  categoryId: string;
};

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
      allowZero: false,
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

export function validateTransactionForm(
  formData: FormData,
): ValidationResult<TransactionFormValues, TransactionValidationErrorCode> {
  const typeResult = parseEnumValue(
    getFormText(formData, "type"),
    transactionTypeValues,
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

  const itemsResult = parseTransactionItems(formData);

  if (!itemsResult.ok) {
    return itemsResult;
  }

  const merchantIdResult = parseOptionalUuidText(
    getFormText(formData, "merchantId"),
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

  return valid({
    accountId: accountIdResult.value,
    items: itemsResult.value,
    merchantId: merchantIdResult.value,
    note: noteResult.value,
    transactionAt,
    type: typeResult.value,
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
