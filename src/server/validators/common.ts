import { getFormText, isUuid } from "utils/formData";

export type ValidationResult<T, E extends string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function valid<T>(value: T): ValidationResult<T, never> {
  return { ok: true, value };
}

export function invalid<E extends string>(
  error: E,
): ValidationResult<never, E> {
  return { ok: false, error };
}

export function parseRequiredText<E extends string>(
  value: string,
  error: E,
): ValidationResult<string, E> {
  const text = value.trim();

  return text.length === 0 ? invalid(error) : valid(text);
}

export function parseMaxLengthText<E extends string>(
  value: string,
  maxLength: number,
  error: E,
): ValidationResult<string, E> {
  return value.length > maxLength ? invalid(error) : valid(value);
}

type TextFieldOptions<E extends string> =
  | {
      maxLength?: undefined;
      maxLengthError?: undefined;
      requiredError: E;
    }
  | {
      maxLength: number;
      maxLengthError: E;
      requiredError: E;
    };

export function parseTextField<E extends string>(
  formData: FormData,
  key: string,
  options: TextFieldOptions<E>,
): ValidationResult<string, E> {
  const requiredResult = parseRequiredText(
    getFormText(formData, key),
    options.requiredError,
  );

  if (!requiredResult.ok) {
    return requiredResult;
  }

  if (options.maxLength !== undefined && options.maxLengthError !== undefined) {
    return parseMaxLengthText(
      requiredResult.value,
      options.maxLength,
      options.maxLengthError,
    );
  }

  return requiredResult;
}

export function parseOptionalTextField<E extends string>(
  formData: FormData,
  key: string,
  maxLength: number,
  error: E,
): ValidationResult<string | null, E> {
  const text = getFormText(formData, key).trim();

  if (text.length === 0) {
    return valid(null);
  }

  if (text.length > maxLength) {
    return invalid(error);
  }

  return valid(text);
}

export function parseUuid<E extends string>(
  value: string,
  error: E,
): ValidationResult<string, E> {
  return isUuid(value) ? valid(value) : invalid(error);
}

export function parseRequiredUuidField<E extends string>(
  formData: FormData,
  key: string,
  error: E,
): ValidationResult<string, E> {
  return parseUuid(getFormText(formData, key), error);
}

export function parseOptionalUuidText<E extends string>(
  value: string,
  error: E,
): ValidationResult<string | null, E> {
  if (value.length === 0) {
    return valid(null);
  }

  return isUuid(value) ? valid(value) : invalid(error);
}

export function parseEnumValue<
  TValues extends readonly string[],
  E extends string,
>(
  value: string,
  values: TValues,
  error: E,
): ValidationResult<TValues[number], E> {
  const normalizedValue = value.trim();

  return (values as readonly string[]).includes(normalizedValue)
    ? valid(normalizedValue as TValues[number])
    : invalid(error);
}

export function parseCurrencyCode<E extends string>(
  value: string,
  error: E,
): ValidationResult<string, E> {
  const currency = value.trim().toUpperCase();

  return /^[A-Z]{3}$/.test(currency) ? valid(currency) : invalid(error);
}

/**
 * 默认拒绝 0；如果业务允许 0，请显式传入 allowZero: true。
 */
export function parseMoneyAmount<E extends string>(
  value: FormDataEntryValue | null,
  options: {
    allowNegative?: boolean;
    allowZero?: boolean;
    emptyFallback?: number;
    error: E;
  },
): ValidationResult<number, E> {
  const text = String(value ?? "").trim();

  if (text.length === 0 && options.emptyFallback !== undefined) {
    return valid(options.emptyFallback);
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    return invalid(options.error);
  }

  const amount = Number(text);

  if (!Number.isFinite(amount)) {
    return invalid(options.error);
  }

  if (!options.allowNegative && amount < 0) {
    return invalid(options.error);
  }

  if (!options.allowZero && amount === 0) {
    return invalid(options.error);
  }

  return valid(amount);
}

export function parseUuidList<E extends string>(
  values: FormDataEntryValue[],
  error: E,
): ValidationResult<string[], E> {
  const uuidValues = values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  const uniqueUuidValues = [...new Set(uuidValues)];

  if (uniqueUuidValues.length === 0) {
    return invalid(error);
  }

  return uniqueUuidValues.every(isUuid)
    ? valid(uniqueUuidValues)
    : invalid(error);
}
