import { useEffect } from "react";

import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { normalizeDraftValue } from "./transactionFilterUtils";

export function TransactionFilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const isKnownValue =
    value === undefined || options.some((option) => option.value === value);

  useEffect(() => {
    if (!isKnownValue) onChange(undefined);
  }, [isKnownValue, onChange]);

  return (
    <TextField
      select
      fullWidth
      label={label}
      size="small"
      value={isKnownValue ? (value ?? "") : ""}
      onChange={(event) => onChange(normalizeDraftValue(event.target.value))}
    >
      <MenuItem value="">全部</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
