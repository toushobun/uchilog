import type { ReactNode } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { IconBadge } from "atoms/ui/IconBadge";
import { outlinedInputTokenSx } from "molecules/ui/outlinedInputTokenSx";

type TransactionSelectionTone =
  | "account"
  | "incoming"
  | "merchant"
  | "outgoing";

type TransactionSelectionValueProps = {
  icon: ReactNode;
  iconLabel?: string;
  text: string;
  tone: TransactionSelectionTone;
};

export function TransactionSelectionValue({
  icon,
  iconLabel,
  text,
  tone,
}: TransactionSelectionValueProps) {
  return (
    <Stack direction="row" spacing={1.25} sx={selectionValueSx}>
      <IconBadge label={iconLabel} size="sm" sx={selectionIconSx[tone]}>
        {icon}
      </IconBadge>
      <Typography noWrap sx={selectionPrimarySx}>
        {text}
      </Typography>
    </Stack>
  );
}

export const transactionSelectionSelectSx = {
  ...outlinedInputTokenSx,
  "& .MuiInputLabel-root": {
    clip: "rect(0 0 0 0)",
    height: 1,
    m: -1,
    overflow: "hidden",
    p: 0,
    position: "absolute",
    width: 1,
  },
  "& .MuiOutlinedInput-root": {
    ...outlinedInputTokenSx["& .MuiOutlinedInput-root"],
    borderRadius: 1.25,
    minHeight: 50,
    pr: 4.5,
  },
  "& .MuiSelect-icon": {
    color: "text.secondary",
    fontSize: "1.8rem",
    right: 10,
  },
  "& .MuiSelect-select": {
    alignItems: "center",
    display: "flex",
    minHeight: "50px !important",
    py: 0,
  },
  "& legend": {
    display: "none",
  },
};

const selectionValueSx = {
  alignItems: "center",
  minWidth: 0,
};

const selectionPrimarySx = {
  color: "text.primary",
  fontSize: "1rem",
  fontWeight: 900,
  minWidth: 0,
};

const selectionIconSx: Record<TransactionSelectionTone, object> = {
  account: {
    bgcolor: "var(--user-theme-transfer-bg)",
    color: "var(--user-theme-tx-accent)",
  },
  incoming: {
    bgcolor: "var(--user-theme-income-bg)",
    color: "var(--user-theme-income-amount)",
  },
  merchant: {
    bgcolor: "var(--user-theme-badge-bg)",
    color: "var(--user-theme-action-text)",
  },
  outgoing: {
    bgcolor: "var(--user-theme-negative-bg)",
    color: "var(--user-theme-negative-amount)",
  },
};
