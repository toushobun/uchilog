"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper, { type PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { designTokens } from "theme/theme";

type FieldCardProps = Omit<PaperProps, "children" | "title"> & {
  action?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  leading?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  title: ReactNode;
};

export function FieldCard({
  action,
  children,
  description,
  disabled = false,
  leading,
  onClick,
  selected = false,
  sx,
  title,
  ...props
}: FieldCardProps) {
  const content = (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      {leading ? <Box sx={{ flexShrink: 0 }}>{leading}</Box> : null}
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="div"
          sx={{ color: "var(--user-theme-field-card-text)", fontWeight: 800 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" component="div" variant="body2">
            {description}
          </Typography>
        ) : null}
        {children ? <Box>{children}</Box> : null}
      </Stack>
    </Stack>
  );

  return (
    <Paper
      data-selected={selected ? "true" : undefined}
      elevation={0}
      sx={[
        {
          backgroundColor: selected
            ? "var(--user-theme-field-card-selected-bg)"
            : "var(--user-theme-card-bg)",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: selected
            ? "var(--user-theme-field-card-selected-border)"
            : "var(--user-theme-card-border)",
          borderRadius: `${designTokens.radius.md}px`,
          boxShadow: selected ? "var(--user-theme-card-shadow)" : "none",
          opacity: disabled ? 0.56 : 1,
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", p: designTokens.spacing.card }}
      >
        {onClick ? (
          <ButtonBase
            aria-pressed={selected}
            component="div"
            disabled={disabled}
            onClick={onClick}
            role="button"
            sx={{
              borderRadius: "inherit",
              display: "block",
              flex: 1,
              minWidth: 0,
              textAlign: "left",
            }}
          >
            {content}
          </ButtonBase>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0 }}>{content}</Box>
        )}
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
    </Paper>
  );
}
