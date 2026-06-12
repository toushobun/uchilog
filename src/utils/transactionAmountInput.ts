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
  expressionText: string | null;
  operator: AmountKeypadOperator | null;
  pendingValue: string | null;
  shouldReplaceDisplay: boolean;
};

export type AmountInputOptions = {
  currency?: string;
};

const maxAmountIntegerDigits = 12;

export function createAmountKeypadState(displayValue = ""): AmountKeypadState {
  return {
    displayValue,
    expressionText: null,
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
  if (!isWithinIntegerDigitLimit(text)) return false;

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
    const expressionText = buildNextExpressionText(state, currentValue, key);

    return {
      displayValue: currentValue,
      expressionText,
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

export function getAmountKeypadPreviewValue(
  state: AmountKeypadState,
  options: AmountInputOptions = {},
) {
  return resolveCurrentDisplayValue(state, options) ?? state.displayValue;
}

export function getAmountKeypadExpressionText(state: AmountKeypadState) {
  if (state.expressionText) {
    if (state.shouldReplaceDisplay) return state.expressionText;

    return `${state.expressionText} ${state.displayValue || "0"}`;
  }

  if (!state.operator || !state.pendingValue) return "";
  if (state.shouldReplaceDisplay)
    return `${state.pendingValue} ${state.operator}`;

  return `${state.pendingValue} ${state.operator} ${state.displayValue || "0"}`;
}

export function confirmAmountKeypadState(
  state: AmountKeypadState,
  options: AmountInputOptions = {},
) {
  const displayState =
    state.displayValue.trim().length === 0
      ? { ...state, displayValue: "0" }
      : state;
  const resolvedValue = resolveCurrentDisplayValue(displayState, options);
  const normalizedValue =
    resolvedValue === null ? null : normalizeMoneyText(resolvedValue, options);

  if (normalizedValue === null || !isValidMoneyText(normalizedValue, options)) {
    return {
      ok: false as const,
      state: {
        ...displayState,
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

function buildNextExpressionText(
  state: AmountKeypadState,
  currentValue: string,
  operator: AmountKeypadOperator,
) {
  if (state.expressionText && state.shouldReplaceDisplay) {
    return state.expressionText.replace(/[+-]$/, operator);
  }

  if (state.operator && state.pendingValue && !state.shouldReplaceDisplay) {
    return `${getAmountKeypadExpressionText(state)} ${operator}`;
  }

  return `${currentValue} ${operator}`;
}

function isDraftMoneyText(value: string, options: AmountInputOptions) {
  const decimalPlaces = getAmountDecimalPlaces(options.currency);

  if (!isWithinIntegerDigitLimit(value)) return false;
  if (decimalPlaces === 0) return /^\d*$/.test(value);

  return new RegExp(`^\\d*(\\.\\d{0,${decimalPlaces}})?$`).test(value);
}

function isWithinIntegerDigitLimit(value: string) {
  const integerText = value.replace(/^-/, "").split(".")[0] ?? "";

  return integerText.length <= maxAmountIntegerDigits;
}

function resolveCurrentDisplayValue(
  state: AmountKeypadState,
  options: AmountInputOptions,
) {
  const normalizedDisplayValue = normalizeMoneyText(
    state.displayValue,
    options,
  );

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
