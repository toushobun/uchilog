"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import type { TransactionRecordType } from "types/transactions";

const typeNavItems = [
  { label: "支出", value: "expense" as const },
  { label: "收入", value: "income" as const },
  { label: "转账", value: "transfer" as const },
];

type TransactionTypeNavigationProps = {
  activeType: TransactionRecordType;
  onChange: (type: TransactionRecordType) => void;
};

export function TransactionTypeNavigation({
  activeType,
  onChange,
}: TransactionTypeNavigationProps) {
  return (
    <ToggleButtonGroup
      aria-label="记账类型"
      exclusive
      fullWidth
      value={activeType}
      onChange={(_, value: TransactionRecordType | null) => {
        if (value) onChange(value);
      }}
    >
      {typeNavItems.map((item) => (
        <ToggleButton key={item.value} value={item.value}>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
