import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { designTokens } from "theme/theme";

export function TransactionFilterResultSummary({
  chips,
  hasActiveFilters,
  label,
  onClear,
}: {
  chips: string[];
  hasActiveFilters: boolean;
  label: string;
  onClear: () => void;
}) {
  return (
    <Stack spacing={1} sx={filterResultSx}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 900 }}>
          {label}
        </Typography>
        {hasActiveFilters ? (
          <Button onClick={onClear} size="small" sx={clearButtonSx}>
            清除
          </Button>
        ) : null}
      </Stack>
      {chips.length > 0 ? (
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ flexWrap: "wrap", rowGap: 0.8 }}
        >
          {chips.map((chip) => (
            <Chip key={chip} label={chip} size="small" sx={resultChipSx} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

const filterResultSx = {
  bgcolor: "var(--user-theme-filter-summary-bg)",
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: `${designTokens.radius.sm}px`,
  px: 1.5,
  py: 1.25,
};

const clearButtonSx = {
  color: "var(--user-theme-action-text)",
  fontSize: 13,
  fontWeight: 900,
  minHeight: 28,
  minWidth: "auto",
  p: 0,
};

const resultChipSx = {
  bgcolor: "background.paper",
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: `${designTokens.radius.sm}px`,
  boxShadow: 1,
  fontSize: 12,
  fontWeight: 800,
  height: 32,
  "& .MuiChip-label": {
    px: 1.5,
  },
};
