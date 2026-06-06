import type { TransactionType } from "types/transactions";
import { getFormText, isUuid } from "utils/formData";

const transactionTypeValues = ["expense", "income"] as const;

export type TransactionFormValues = {
  type: TransactionType;
  transactionAt: string;
  amount: number;
  accountId: string;
  categoryId: string;
  merchantId: string | null;
  note: string | null;
};

export type TransactionValidationErrorCode =
  | "account_invalid"
  | "amount_invalid"
  | "category_invalid"
  | "date_invalid"
  | "merchant_invalid"
  | "type_invalid";

export type TransactionValidationResult =
  | {
      ok: true;
      value: TransactionFormValues;
    }
  | {
      ok: false;
      error: TransactionValidationErrorCode;
    };

function parseTransactionType(value: string): TransactionType | null {
  return transactionTypeValues.includes(value as TransactionType)
    ? (value as TransactionType)
    : null;
}

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

function parseAmount(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

export function validateTransactionForm(
  formData: FormData,
): TransactionValidationResult {
  const type = parseTransactionType(getFormText(formData, "type"));

  if (!type) {
    return { ok: false, error: "type_invalid" };
  }

  const offsetMinutes = parseTimeZoneOffsetMinutes(
    getFormText(formData, "timeZoneOffsetMinutes"),
  );

  if (offsetMinutes === null) {
    return { ok: false, error: "date_invalid" };
  }

  const transactionAt = parseTransactionAt(
    getFormText(formData, "transactionAt"),
    offsetMinutes,
  );

  if (!transactionAt) {
    return { ok: false, error: "date_invalid" };
  }

  const amount = parseAmount(getFormText(formData, "amount"));

  if (amount === null) {
    return { ok: false, error: "amount_invalid" };
  }

  const accountId = getFormText(formData, "accountId");

  if (!isUuid(accountId)) {
    return { ok: false, error: "account_invalid" };
  }

  const categoryId = getFormText(formData, "categoryId");

  if (!isUuid(categoryId)) {
    return { ok: false, error: "category_invalid" };
  }

  const merchantIdText = getFormText(formData, "merchantId");
  const merchantId = merchantIdText.length > 0 ? merchantIdText : null;

  if (merchantId && !isUuid(merchantId)) {
    return { ok: false, error: "merchant_invalid" };
  }

  const noteText = getFormText(formData, "note");

  return {
    ok: true,
    value: {
      accountId,
      amount,
      categoryId,
      merchantId,
      note: noteText.length > 0 ? noteText : null,
      transactionAt,
      type,
    },
  };
}

export function getBalanceDelta(type: TransactionType, amount: number) {
  return type === "expense" ? -amount : amount;
}
