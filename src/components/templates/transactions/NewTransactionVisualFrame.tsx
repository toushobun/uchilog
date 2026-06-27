"use client";

import type { ReactNode } from "react";

import Box from "@mui/material/Box";

export function NewTransactionVisualFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        boxShadow: (theme) =>
          `0 0 0 100vmax ${theme.palette.background.default}`,
        clipPath: "inset(0 -100vmax)",
        color: "text.primary",
        minHeight: "100dvh",
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        py: { xs: 2, sm: 3 },
        "& .MuiToggleButtonGroup-root": {
          bgcolor: "var(--user-theme-segment-bg)",
          border: 0,
          borderRadius: 1.25,
          boxShadow: "none",
          gap: 0,
          mb: 1.75,
          p: 0.375,
        },
        "& .MuiToggleButton-root": {
          border: 0,
          borderRadius: 1,
          color: "var(--user-theme-segment-text)",
          fontSize: "0.92rem",
          fontWeight: 900,
          minHeight: 36,
          py: 0.5,
        },
        "& .MuiToggleButton-root.Mui-selected": {
          bgcolor: "var(--user-theme-segment-selected-bg)",
          boxShadow: "var(--user-theme-card-shadow)",
          color: "var(--user-theme-segment-selected-text)",
        },
        "& .MuiToggleButton-root.Mui-selected:hover": {
          bgcolor: "var(--user-theme-segment-selected-bg)",
        },
        "& .MuiPaper-outlined": {
          bgcolor: "var(--user-theme-card-bg)",
          border: "1px solid var(--user-theme-card-border)",
          borderRadius: 1.5,
          boxShadow: "var(--user-theme-card-shadow)",
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
          bgcolor: "var(--user-theme-action-text)",
          boxShadow: "0 8px 18px var(--user-theme-fab-shadow)",
        },
      }}
    >
      {children}
    </Box>
  );
}
