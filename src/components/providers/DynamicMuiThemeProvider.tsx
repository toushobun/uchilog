"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { theme as baseTheme } from "theme/theme";
import { useUserTheme } from "theme/UserThemeProvider";

type DynamicMuiThemeProviderProps = {
  children: ReactNode;
};

export function DynamicMuiThemeProvider({
  children,
}: DynamicMuiThemeProviderProps) {
  const { tokens, themeKey } = useUserTheme();
  const token = tokens[themeKey];

  const dynamicTheme = useMemo(
    () =>
      createTheme(baseTheme, {
        palette: {
          primary: {
            main: token.palette.accent,
            light: token.palette.accentLight,
            dark: token.palette.accentDeep,
          },
          background: {
            default: token.palette.page,
            paper: token.palette.card,
          },
          text: {
            primary: token.palette.text,
            secondary: token.palette.textMuted,
          },
          divider: token.palette.divider,
        },
      }),
    [token],
  );

  return <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>;
}
