"use client";

import type { ReactNode } from "react";

import Box from "@mui/material/Box";

const pageBg = "#fff8ed";
const cardBorder = "rgba(133, 77, 14, 0.12)";
const cardBg = "rgba(255, 253, 248, 0.94)";
const cardShadow = "0 8px 18px rgba(120, 53, 15, 0.05)";
const textColor = "#4a2f1b";
const accentColor = "#d97706";

export function NewTransactionVisualFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: pageBg,
        boxShadow: `0 0 0 100vmax ${pageBg}`,
        clipPath: "inset(0 -100vmax)",
        color: textColor,
        minHeight: "100dvh",
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        py: { xs: 2, sm: 3 },
        "& .MuiToggleButtonGroup-root": {
          bgcolor: "rgba(232, 223, 212, 0.88)",
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
          color: "rgba(74, 47, 27, 0.58)",
          fontSize: "0.92rem",
          fontWeight: 900,
          minHeight: 36,
          py: 0.5,
        },
        "& .MuiToggleButton-root.Mui-selected": {
          bgcolor: "rgba(255, 255, 255, 0.96)",
          boxShadow: "0 8px 18px rgba(74, 47, 27, 0.08)",
          color: accentColor,
        },
        "& .MuiToggleButton-root.Mui-selected:hover": {
          bgcolor: "rgba(255, 255, 255, 0.96)",
        },
        "& .MuiPaper-outlined": {
          bgcolor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 1.5,
          boxShadow: cardShadow,
        },
        "& .MuiTextField-root .MuiOutlinedInput-root": {
          bgcolor: cardBg,
          borderRadius: 1.25,
        },
        "& .MuiTextField-root .MuiInputLabel-root": {
          color: "rgba(74, 47, 27, 0.58)",
          fontWeight: 700,
        },
        "& .MuiButton-outlined": {
          borderColor: "rgba(217, 119, 6, 0.42)",
          borderRadius: 1.25,
          color: accentColor,
          fontWeight: 800,
        },
        "& .MuiButton-contained:not(.Mui-disabled)": {
          bgcolor: accentColor,
          boxShadow: "0 8px 18px rgba(217, 119, 6, 0.18)",
        },
      }}
    >
      {children}
    </Box>
  );
}
