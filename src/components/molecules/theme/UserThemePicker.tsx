"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useUserTheme } from "theme/UserThemeProvider";

export function UserThemePicker() {
  const { isThemeReady, themeKey, setThemeKey, themeKeys, tokens } =
    useUserTheme();

  if (!isThemeReady) {
    return (
      <Stack
        aria-hidden="true"
        direction="row"
        spacing={0.75}
        sx={{ overflow: "hidden", pb: 0.25 }}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={`theme-placeholder-${index}`}
            height={30}
            sx={{ borderRadius: 999, flexShrink: 0 }}
            variant="rounded"
            width={96}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack
      aria-label="个人主题"
      direction="row"
      role="listbox"
      sx={{
        gap: 0.75,
        maxWidth: "100%",
        overflowX: "auto",
        pb: 0.25,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {themeKeys.map((key) => {
        const theme = tokens[key];
        const selected = key === themeKey;

        return (
          <Tooltip key={key} title={theme.label}>
            <ButtonBase
              aria-label={`切换到${theme.label}`}
              aria-selected={selected}
              onClick={() => setThemeKey(key)}
              role="option"
              sx={{
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.62)",
                border: "2px solid",
                borderColor: selected
                  ? "var(--user-theme-bottom-nav-active)"
                  : "transparent",
                borderRadius: 999,
                boxShadow: selected
                  ? "0 3px 14px rgba(0, 0, 0, 0.18)"
                  : "0 2px 8px rgba(0, 0, 0, 0.08)",
                color: selected ? "text.primary" : "text.secondary",
                display: "inline-flex",
                flexShrink: 0,
                gap: 0.75,
                minHeight: 30,
                px: 1.25,
                py: 0.5,
                transition:
                  "border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease",
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  background: theme.switcherGradient,
                  borderRadius: "50%",
                  flexShrink: 0,
                  height: 13,
                  width: 13,
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: selected ? 700 : 500,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {theme.label}
              </Typography>
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
