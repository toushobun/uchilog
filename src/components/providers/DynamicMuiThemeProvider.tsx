"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { theme as baseTheme } from "theme/theme";
import { useUserTheme } from "theme/UserThemeProvider";
import { type UserThemeKey, userThemeTokens } from "theme/userThemeTokens";

type DynamicMuiThemeProviderProps = {
  children: ReactNode;
};

export function createDynamicMuiTheme(themeKey: UserThemeKey) {
  const token = userThemeTokens[themeKey];
  const overlayPaperBackground = baseTheme.palette.background.paper;

  return createTheme(baseTheme, {
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
    components: {
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: overlayPaperBackground,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: overlayPaperBackground,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: overlayPaperBackground,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: overlayPaperBackground,
          },
        },
      },
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
