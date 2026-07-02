import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { TransactionGroupBy } from "types/transactions";

import { TransactionFilterChip } from "./TransactionFilterChip";

export function TransactionFilterGroupSelector({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly { label: string; value: TransactionGroupBy }[];
  selected: TransactionGroupBy;
  onSelect: (value: TransactionGroupBy) => void;
}) {
  return (
    <Stack spacing={0.8}>
      <Typography
        sx={{ color: "text.secondary", fontSize: 12, fontWeight: 800 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.9}
        sx={{ flexWrap: "wrap", rowGap: 0.9 }}
      >
        {options.map((option) => (
          <TransactionFilterChip
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
