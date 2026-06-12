"use client";

import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  applyAmountKeypadKey,
  confirmAmountKeypadState,
  createAmountKeypadState,
  getAmountDecimalPlaces,
  type AmountKeypadKey,
  type AmountKeypadState,
} from "utils/transactionAmountInput";

type TransactionAmountKeypadProps = {
  currency?: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
  value: string;
};

const keypadRows: AmountKeypadKey[][] = [
  ["7", "8", "9", "backspace"],
  ["4", "5", "6", "+"],
  ["1", "2", "3", "-"],
  ["0", ".", "clear"],
];

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
  "backspace": "⌫",
  "clear": "C",
};

const keyAriaLabels: Record<string, string | undefined> = {
  "+": "加",
  "-": "减",
  "backspace": "删除",
  "clear": "清空",
};

export function TransactionAmountKeypad({
  currency,
  onChange,
  onConfirm,
  value,
}: TransactionAmountKeypadProps) {
  const [state, setState] = useState<AmountKeypadState>(() =>
    createAmountKeypadState(value),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setState((currentState) =>
      currentState.displayValue === value
        ? currentState
        : createAmountKeypadState(value),
    );
  }, [value]);

  function handleKeyClick(key: AmountKeypadKey) {
    const nextState = applyAmountKeypadKey(state, key, { currency });
    setState(nextState);
    setErrorMessage(null);

    if (nextState.displayValue !== state.displayValue) {
      onChange(nextState.displayValue);
    }
  }

  function handleConfirm() {
    const result = confirmAmountKeypadState(state, { currency });
    setState(result.state);

    if (!result.ok) {
      setErrorMessage("请输入有效金额。");
      return;
    }

    setErrorMessage(null);
    onChange(result.value);
    onConfirm(result.value);
  }

  const decimalDisabled = getAmountDecimalPlaces(currency) === 0;

  return (
    <Paper
      aria-label="金额计算器"
      variant="outlined"
      sx={{ bgcolor: "background.paper", p: 1.5 }}
    >
      <Stack spacing={1.25}>
        <Stack spacing={0.25}>
          <Typography color="text.secondary" variant="caption">
            金额计算器{currency ? `（${currency}）` : ""}
          </Typography>
          <Typography
            aria-label="计算器显示金额"
            sx={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "right" }}
          >
            {state.displayValue || "0"}
          </Typography>
          {state.operator && state.pendingValue ? (
            <Typography color="text.secondary" variant="caption">
              {state.pendingValue} {state.operator}
            </Typography>
          ) : null}
          {errorMessage ? (
            <Typography color="error" variant="caption">
              {errorMessage}
            </Typography>
          ) : null}
        </Stack>

        {keypadRows.map((row) => (
          <Stack key={row.join("")} direction="row" spacing={1}>
            {row.map((key) => (
              <Button
                key={key}
                aria-label={keyAriaLabels[key]}
                disabled={key === "." && decimalDisabled}
                fullWidth
                onClick={() => handleKeyClick(key)}
                type="button"
                variant={key === "+" || key === "-" ? "outlined" : "contained"}
                sx={{ minHeight: 44 }}
              >
                {keyLabels[key]}
              </Button>
            ))}
          </Stack>
        ))}

        <Button
          fullWidth
          onClick={handleConfirm}
          type="button"
          variant="contained"
          sx={{
            background: "var(--user-theme-fab-bg)",
            color: "white",
            minHeight: 44,
          }}
        >
          确认
        </Button>
      </Stack>
    </Paper>
  );
}
