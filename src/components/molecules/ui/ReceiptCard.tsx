import Box from "@mui/material/Box";
import Paper, { type PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";

import { designTokens } from "theme/theme";

type ReceiptCardProps = Omit<PaperProps, "children"> & {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
};

export function ReceiptCard({
  children,
  footer,
  header,
  sx,
  ...props
}: ReceiptCardProps) {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          backgroundColor: "var(--user-theme-receipt-bg)",
          backgroundImage: "none",
          border: "1px solid var(--user-theme-receipt-border)",
          borderRadius: `${designTokens.radius.md}px`,
          boxShadow: "var(--user-theme-card-shadow)",
          color: "var(--user-theme-receipt-text)",
          overflow: "hidden",
          position: "relative",
          px: designTokens.spacing.card,
          py: 2.5,
          "&::before, &::after": {
            backgroundRepeat: "repeat-x",
            backgroundSize: "12px 10px",
            content: '""',
            height: 10,
            left: 0,
            pointerEvents: "none",
            position: "absolute",
            right: 0,
            zIndex: 1,
          },
          "&::before": {
            backgroundImage:
              "radial-gradient(circle at 6px 10px, var(--user-theme-receipt-tear-bg) 6px, transparent 6px)",
            top: 0,
          },
          "&::after": {
            backgroundImage:
              "radial-gradient(circle at 6px 0px, var(--user-theme-receipt-tear-bg) 6px, transparent 6px)",
            bottom: 0,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      <Stack spacing={1.5}>
        {header ? <Box>{header}</Box> : null}
        {header ? <ReceiptCardDivider /> : null}
        <Box>{children}</Box>
        {footer ? <ReceiptCardDivider /> : null}
        {footer ? <Box>{footer}</Box> : null}
      </Stack>
    </Paper>
  );
}

export function ReceiptCardDivider() {
  return (
    <Box
      aria-hidden="true"
      sx={{ borderTop: "1px dashed var(--user-theme-receipt-border)" }}
    />
  );
}
