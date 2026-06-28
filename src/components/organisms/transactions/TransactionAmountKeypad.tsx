"use client";

import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  applyAmountKeypadKey,
  confirmAmountKeypadState,
  createAmountKeypadState,
  getAmountDecimalPlaces,
  getAmountKeypadExpressionText,
  getAmountKeypadPreviewValue,
  type AmountKeypadKey,
  type AmountKeypadState,
} from "utils/transactionAmountInput";
import { transactionFormValidationMessages } from "utils/transactionMessages";

type TransactionAmountKeypadProps = {
  currency?: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
  value: string;
};

type InternalAmountKeypadState = AmountKeypadState & {
  externalValue: string;
};

const confirmButtonInsertIndex = 11;

const keypadKeys: AmountKeypadKey[] = [
  "7",
  "8",
  "9",
  "-",
  "4",
  "5",
  "6",
  "+",
  "1",
  "2",
  "3",
  ".",
  "0",
  "backspace",
];

const currencySymbols: Record<string, string> = {
  AUD: "A$",
  CAD: "C$",
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  HKD: "HK$",
  JPY: "¥",
  KRW: "₩",
  SGD: "S$",
  THB: "฿",
  TWD: "NT$",
  USD: "$",
};

const keyLabels: Record<AmountKeypadKey, string> = {
  "+": "+",
  "-": "-",
  ".": ".",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  backspace: "⌫",
  clear: "清空",
};

const keyAriaLabels: Record<string, string | undefined> = {
  "+": "加",
  "-": "减",
  backspace: "退格",
};

export function TransactionAmountKeypad({
  currency,
  onChange,
  onConfirm,
  value,
}: TransactionAmountKeypadProps) {
  const [state, setState] = useState<InternalAmountKeypadState>(() =>
    withExternalValue(createAmountKeypadState(value), value),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const decimalDisabled = getAmountDecimalPlaces(currency) === 0;
  const syncedState = getSyncedAmountKeypadState(state, value);
  const previewValue = getAmountKeypadPreviewValue(syncedState, { currency });
  const expressionText = getAmountKeypadExpressionText(syncedState);
  const currencySymbol = getCurrencySymbol(currency) || "¥";

  function handleKeyClick(key: AmountKeypadKey) {
    const nextState = applyAmountKeypadKey(syncedState, key, { currency });
    const nextPreviewValue = getAmountKeypadPreviewValue(nextState, {
      currency,
    });
    setState(withExternalValue(nextState, value));
    setErrorMessage(null);

    if (nextPreviewValue !== previewValue) {
      onChange(nextPreviewValue);
    }
  }

  function handleConfirm() {
    const result = confirmAmountKeypadState(syncedState, { currency });
    setState(withExternalValue(result.state, value));

    if (!result.ok) {
      setErrorMessage(transactionFormValidationMessages.amountInvalid);
      return;
    }

    setErrorMessage(null);
    if (result.value !== previewValue) {
      onChange(result.value);
    }
    onConfirm(result.value);
  }

  function renderKeyButton(key: AmountKeypadKey) {
    const isOperator = key === "+" || key === "-";

    return (
      <Button
        key={key}
        aria-label={keyAriaLabels[key]}
        disabled={key === "." && decimalDisabled}
        fullWidth
        onClick={() => handleKeyClick(key)}
        type="button"
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRadius: 2.5,
          color: isOperator ? "var(--user-theme-action-text)" : "text.primary",
          fontSize: "1.25rem",
          fontWeight: 800,
          minHeight: 52,
          minWidth: 0,
          p: 0,
          "&:hover": {
            bgcolor: "background.default",
            borderColor: isOperator
              ? "var(--user-theme-action-text)"
              : "divider",
          },
        }}
      >
        {keyLabels[key]}
      </Button>
    );
  }

  return (
    <Paper
      aria-label="金额计算器"
      variant="outlined"
      sx={{
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Stack spacing={0.75}>
          <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
            <Typography
              aria-label="计算器显示金额"
              sx={{ flex: 1, fontSize: "1.75rem", fontWeight: 800 }}
            >
              {currencySymbol ? `${currencySymbol} ` : ""}
              {previewValue || "0"}
            </Typography>
            <Button
              onClick={() => handleKeyClick("clear")}
              size="small"
              type="button"
              variant="text"
              sx={{ color: "text.secondary", minWidth: 56 }}
            >
              清空
            </Button>
          </Box>
          {expressionText ? (
            <Typography color="text.secondary" variant="caption">
              {expressionText}
            </Typography>
          ) : null}
          {errorMessage ? (
            <Typography color="error" variant="caption">
              {errorMessage}
            </Typography>
          ) : null}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          }}
        >
          {keypadKeys.slice(0, confirmButtonInsertIndex).map(renderKeyButton)}
          <Button
            fullWidth
            onClick={handleConfirm}
            type="button"
            variant="contained"
            sx={{
              background: "var(--user-theme-fab-bg)",
              borderRadius: 2.5,
              color: "white",
              fontWeight: 800,
              gridColumn: 4,
              gridRow: "3 / span 2",
              minHeight: 112,
              "&:hover": { background: "var(--user-theme-fab-bg)" },
            }}
          >
            确认
          </Button>
          {keypadKeys.slice(confirmButtonInsertIndex).map(renderKeyButton)}
        </Box>
      </Stack>
    </Paper>
  );
}

function getCurrencySymbol(currency?: string) {
  const normalizedCurrency = currency?.trim().toUpperCase();

  if (!normalizedCurrency) return "";

  return currencySymbols[normalizedCurrency] ?? normalizedCurrency;
}

function withExternalValue(
  state: AmountKeypadState,
  externalValue: string,
): InternalAmountKeypadState {
  return { ...state, externalValue };
}

function getSyncedAmountKeypadState(
  state: InternalAmountKeypadState,
  value: string,
) {
  const didValueChange = state.externalValue !== value;

  if (
    didValueChange &&
    value.trim().length === 0 &&
    (state.displayValue.trim().length > 0 || state.operator)
  ) {
    return withExternalValue(createAmountKeypadState(), value);
  }

  if (!didValueChange || state.operator || state.displayValue === value) {
    return withExternalValue(state, value);
  }

  return withExternalValue(createAmountKeypadState(value), value);
}
