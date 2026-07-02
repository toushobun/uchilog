import Chip from "@mui/material/Chip";

type TransactionFilterChipProps = {
  label: string;
  selected?: boolean;
  onClick: () => void;
};

export function TransactionFilterChip({
  label,
  selected = false,
  onClick,
}: TransactionFilterChipProps) {
  return (
    <Chip
      clickable
      aria-pressed={selected}
      label={label}
      onClick={onClick}
      sx={[chipSx, ...(selected ? [selectedChipSx] : [])]}
    />
  );
}

const chipSx = {
  bgcolor: "var(--user-theme-card-bg)",
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: 3,
  color: "text.primary",
  fontSize: 12,
  fontWeight: 800,
  height: 34,
  px: 0.4,
  "&:hover": {
    bgcolor: "var(--user-theme-badge-bg)",
  },
};

const selectedChipSx = {
  bgcolor: "var(--user-theme-field-card-selected-bg)",
  borderColor: "var(--user-theme-action-bg)",
  color: "var(--user-theme-action-bg)",
};
