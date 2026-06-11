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
  const primaryColor = tokens[themeKey].actionTextColor;

  const dynamicTheme = useMemo(
    () =>
      createTheme(baseTheme, {
        palette: {
          primary: {
            main: primaryColor,
          },
        },
      }),
    [primaryColor],
  );

  return <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>;
}
