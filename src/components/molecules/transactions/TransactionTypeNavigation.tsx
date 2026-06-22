"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import type { TransactionRecordType } from "types/transactions";

type TransactionTypeNavigationProps = {
  onChange: (type: TransactionRecordType) => void;
  value: TransactionRecordType;
};

const transactionTypeNavigationOptions = [
  { label: "支出", value: "expense" },
  { label: "收入", value: "income" },
  { label: "转账", value: "transfer" },
] as const;

export function TransactionTypeNavigation({
  onChange,
  value,
}: TransactionTypeNavigationProps) {
  return (
    <ToggleButtonGroup
      aria-label="记账类型"
      exclusive
      fullWidth
      onChange={(_, newValue: unknown) => {
        if (isTransactionRecordType(newValue)) {
          onChange(newValue);
        }
      }}
      value={value}
      sx={selectedToggleButtonGroupSx}
    >
      {transactionTypeNavigationOptions.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function isTransactionRecordType(
  value: unknown,
): value is TransactionRecordType {
  return value === "expense" || value === "income" || value === "transfer";
}

const selectedToggleButtonGroupSx = {
  "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
    color: "var(--user-theme-action-text)",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
  },
};
