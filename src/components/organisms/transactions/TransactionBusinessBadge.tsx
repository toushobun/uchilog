import Chip, { type ChipProps } from "@mui/material/Chip";
import type { ReactNode } from "react";

import {
  transactionBusinessBadgeConfig,
  type TransactionBusinessBadgeStatus,
} from "./transactionBusinessBadgeConfig";

type TransactionBusinessBadgeProps = Omit<ChipProps, "color" | "label"> & {
  label?: ReactNode;
  status: TransactionBusinessBadgeStatus;
};

export function TransactionBusinessBadge({
  label,
  size = "small",
  status,
  sx,
  ...props
}: TransactionBusinessBadgeProps) {
  const config = transactionBusinessBadgeConfig[status];

  return (
    <Chip
      label={label ?? config.label}
      size={size}
      sx={[
        {
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontWeight: 800,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
