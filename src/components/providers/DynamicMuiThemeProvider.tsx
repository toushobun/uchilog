"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { theme as baseTheme } from "theme/theme";
import { useUserTheme } from "theme/UserThemeProvider";
import {
  type UserThemeKey,
  userThemeTokens,
} from "theme/userThemeTokens";

type DynamicMuiThemeProviderProps = {
  children: ReactNode;
};

export function createDynamicMuiTheme(themeKey: UserThemeKey) {
  const token = userThemeTokens[themeKey];

  return createTheme(baseTheme, {
    palette: {
      primary: {
        main: token.palette.accent,
        light: token.palette.accentLight,
        dark: token.palette.accentDeep,
      },
      background: {
        default: token.palette.page,
      },
      text: {
        primary: token.palette.text,
        secondary: token.palette.textMuted,
      },
      divider: token.palette.divider,
    },
  });
}

export function DynamicMuiThemeProvider({
  children,
}: DynamicMuiThemeProviderProps) {
  const { themeKey } = useUserTheme();

  const dynamicTheme = useMemo(
    () => createDynamicMuiTheme(themeKey),
    [themeKey],
  );

  return <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>;
}
