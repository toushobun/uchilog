export type AmountKeypadOperator = "+" | "-";

export type AmountKeypadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "backspace"
  | "clear";

export type AmountKeypadState = {
  displayValue: string;
  operator: AmountKeypadOperator | null;
  pendingValue: string | null;
  shouldReplaceDisplay: boolean;
};

export type AmountInputOptions = {
  currency?: string;
};

export function createAmountKeypadState(
  displayValue = "",
): AmountKeypadState {
  return {
    displayValue,
    operator: null,
    pendingValue: null,
    shouldReplaceDisplay: false,
  };
}

export function getAmountDecimalPlaces(currency?: string) {
  return currency?.toUpperCase() === "JPY" ? 0 : 2;
}

export function isValidMoneyText(
  value: string,
  options: AmountInputOptions = {},
) {
  const text = value.trim();
  const decimalPlaces = getAmountDecimalPlaces(options.currency);
  const pattern =
    decimalPlaces === 0
      ? /^\d+$/
      : new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);

  if (!pattern.test(text)) return false;

  const amount = Number(text);

  return Number.isFinite(amount) && amount >= 0;
}

export function isValidPositiveMoneyText(
  value: string,
  options: AmountInputOptions = {},
) {
  return isValidMoneyText(value, options) && Number(value.trim()) > 0;
}

export function normalizeMoneyText(
  value: string,
  options: AmountInputOptions = {},
) {
  const text = value.trim();
  if (!isValidMoneyText(text, options)) return null;

  const decimalPlaces = getAmountDecimalPlaces(options.currency);
  const [integerText, decimalText] = text.split(".");
  const normalizedInteger = String(Number(integerText));

  if (decimalPlaces === 0 || decimalText === undefined) {
    return normalizedInteger;
  }

  const normalizedDecimal = decimalText.replace(/0+$/, "");

  return normalizedDecimal.length > 0
    ? `${normalizedInteger}.${normalizedDecimal}`
    : normalizedInteger;
}

export function applyAmountKeypadKey(
  state: AmountKeypadState,
  key: AmountKeypadKey,
  options: AmountInputOptions = {},
): AmountKeypadState {
  if (key === "clear") return createAmountKeypadState();

  if (key === "backspace") {
    return {
      ...state,
      displayValue: state.shouldReplaceDisplay
        ? ""
        : state.displayValue.slice(0, -1),
      shouldReplaceDisplay: false,
    };
  }

  if (key === "+" || key === "-") {
    const currentValue = resolveCurrentDisplayValue(state, options);
    if (!currentValue) return state;

    return {
      displayValue: currentValue,
      operator: key,
      pendingValue: currentValue,
      shouldReplaceDisplay: true,
    };
  }

  if (key === ".") {
    if (getAmountDecimalPlaces(options.currency) === 0) return state;
    if (state.displayValue.includes(".")) return state;

    return {
      ...state,
      displayValue: state.shouldReplaceDisplay
        ? "0."
        : `${state.displayValue || "0"}.`,
      shouldReplaceDisplay: false,
    };
  }

  const nextDisplayValue = buildNextDigitDisplayValue(
    state.displayValue,
    key,
    state.shouldReplaceDisplay,
  );

  if (!isDraftMoneyText(nextDisplayValue, options)) return state;

  return {
    ...state,
    displayValue: nextDisplayValue,
    shouldReplaceDisplay: false,
  };
}

export function confirmAmountKeypadState(
  state: AmountKeypadState,
  options: AmountInputOptions = {},
) {
  const resolvedValue = resolveCurrentDisplayValue(state, options);
  const normalizedValue = resolvedValue
    ? normalizeMoneyText(resolvedValue, options)
    : null;

  if (!normalizedValue || !isValidPositiveMoneyText(normalizedValue, options)) {
    return {
      ok: false as const,
      state: {
        ...state,
        displayValue: resolvedValue ?? state.displayValue,
        shouldReplaceDisplay: false,
      },
    };
  }

  return {
    ok: true as const,
    state: createAmountKeypadState(normalizedValue),
    value: normalizedValue,
  };
}

function buildNextDigitDisplayValue(
  currentDisplayValue: string,
  digit: Exclude<AmountKeypadKey, "." | "+" | "-" | "backspace" | "clear">,
  shouldReplaceDisplay: boolean,
) {
  if (shouldReplaceDisplay) return digit;
  if (currentDisplayValue === "0") return digit === "0" ? "0" : digit;

  return `${currentDisplayValue}${digit}`;
}

function isDraftMoneyText(value: string, options: AmountInputOptions) {
  const decimalPlaces = getAmountDecimalPlaces(options.currency);

  if (decimalPlaces === 0) return /^\d*$/.test(value);

  return new RegExp(`^\\d*(\\.\\d{0,${decimalPlaces}})?$`).test(value);
}

function resolveCurrentDisplayValue(
  state: AmountKeypadState,
  options: AmountInputOptions,
) {
  const normalizedDisplayValue = normalizeMoneyText(state.displayValue, options);

  if (!normalizedDisplayValue) return null;

  if (!state.operator || !state.pendingValue || state.shouldReplaceDisplay) {
    return normalizedDisplayValue;
  }

  return calculateAmount(
    state.pendingValue,
    normalizedDisplayValue,
    state.operator,
    options,
  );
}

function calculateAmount(
  leftValue: string,
  rightValue: string,
  operator: AmountKeypadOperator,
  options: AmountInputOptions,
) {
  const decimalPlaces = getAmountDecimalPlaces(options.currency);
  const left = toScaledInteger(leftValue, decimalPlaces);
  const right = toScaledInteger(rightValue, decimalPlaces);
  const result = operator === "+" ? left + right : left - right;

  return fromScaledInteger(result, decimalPlaces);
}

function toScaledInteger(value: string, decimalPlaces: number) {
  const [integerText, decimalText = ""] = value.split(".");
  const normalizedDecimalText = decimalText
    .padEnd(decimalPlaces, "0")
    .slice(0, decimalPlaces);

  return Number(`${integerText}${normalizedDecimalText}`);
}

function fromScaledInteger(value: number, decimalPlaces: number) {
  if (decimalPlaces === 0) return String(value);

  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const factor = 10 ** decimalPlaces;
  const integerText = String(Math.floor(absoluteValue / factor));
  const decimalText = String(absoluteValue % factor)
    .padStart(decimalPlaces, "0")
    .replace(/0+$/, "");

  return decimalText.length > 0
    ? `${sign}${integerText}.${decimalText}`
    : `${sign}${integerText}`;
}
