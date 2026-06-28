"use client";

import type { ReactNode } from "react";

import Box from "@mui/material/Box";

export function NewTransactionVisualFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box data-testid="transaction-page-frame" sx={transactionPageFrameSx}>
      {children}
    </Box>
  );
}

const transactionPageFrameSx = {
  color: "text.primary",
  display: "flex",
  flexDirection: "column",
  isolation: "isolate",
  marginInline: "auto",
  maxWidth: 480,
  minWidth: 0,
  position: "relative",
  px: { xs: 1.5, sm: 2 },
  pb: { xs: 2, sm: 3 },
  pt: { xs: 1, sm: 1.5 },
  width: "100%",
  "&::before": {
    bgcolor: "var(--user-theme-card-bg)",
    content: '\"\"',
    inset: 0,
    position: "fixed",
    zIndex: -1,
  },
  "& .MuiToggleButtonGroup-root": {
    bgcolor: "var(--user-theme-segment-bg)",
    border: 0,
    borderRadius: 2.5,
    boxShadow: "none",
    gap: 0,
    mb: 2,
    p: 0.375,
  },
  "& .MuiToggleButton-root": {
    border: 0,
    borderRadius: 2.25,
    color: "var(--user-theme-segment-text)",
    fontSize: "0.875rem",
    fontWeight: 800,
    minHeight: 34,
    py: 0.5,
  },
  "& .MuiToggleButton-root.Mui-selected": {
    background: "var(--user-theme-fab-bg)",
    boxShadow: "var(--user-theme-card-shadow)",
    color: "var(--user-theme-fab-text) !important",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    background: "var(--user-theme-fab-bg)",
  },
  "& .MuiPaper-outlined": {
    bgcolor: "var(--user-theme-card-bg)",
    border: "1px solid var(--user-theme-card-border)",
    borderRadius: 1.25,
    boxShadow: "none",
  },
  "& .MuiTextField-root .MuiOutlinedInput-root": {
    bgcolor: "var(--user-theme-card-bg)",
    borderRadius: 1.25,
  },
  "& .MuiTextField-root .MuiInputLabel-root": {
    color: "text.secondary",
    fontWeight: 700,
  },
  "& .MuiButton-outlined": {
    borderColor: "var(--user-theme-field-card-selected-border)",
    borderRadius: 1.25,
    color: "var(--user-theme-action-text)",
    fontWeight: 800,
  },
  "& .MuiButton-contained:not(.Mui-disabled)": {
    background: "var(--user-theme-fab-bg)",
    boxShadow: "0 8px 18px var(--user-theme-fab-shadow)",
    color: "var(--user-theme-fab-text)",
  },
} as const;
