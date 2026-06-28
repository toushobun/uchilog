import { createTheme } from "@mui/material/styles";

import { typographyFontFamilies, typographyStyles } from "./typographyTokens";
import { appZIndex } from "./zIndex";

const fontFamily = typographyFontFamilies.body;

export const designTokens = {
  color: {
    background: {
      app: "#FDF8F0",
      paper: "#FFFDF8",
      subtle: "#F7EFE5",
    },
    border: {
      subtle: "rgba(200, 185, 168, 0.45)",
    },
    brand: {
      main: "#E8930A",
      light: "#FEF3DC",
      dark: "#C47A08",
    },
    text: {
      primary: "#3D2E22",
      secondary: "#7A6A5E",
    },
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  opacity: {
    disabled: 0.56,
  },
  typography: {
    fontFamily: typographyFontFamilies,
    serifFontFamily: typographyFontFamilies.brand,
    style: typographyStyles,
  },
  shadow: {
    card: "0 12px 32px rgba(61, 46, 34, 0.08)",
    dialog: "0 24px 64px rgba(61, 46, 34, 0.16)",
  },
  spacing: {
    page: {
      mobile: 2,
      desktop: 3,
    },
    card: 2,
  },
} as const;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: designTokens.color.brand.main,
      light: designTokens.color.brand.light,
      dark: designTokens.color.brand.dark,
    },
    background: {
      default: designTokens.color.background.app,
      paper: designTokens.color.background.paper,
    },
    text: {
      primary: designTokens.color.text.primary,
      secondary: designTokens.color.text.secondary,
    },
    divider: designTokens.color.border.subtle,
  },
  typography: {
    fontFamily,
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    body1: {
      ...typographyStyles.bodyRelaxed,
    },
    body2: {
      ...typographyStyles.body,
    },
    button: {
      ...typographyStyles.button,
    },
    caption: {
      ...typographyStyles.chipBadge,
      fontSize: "0.75rem",
    },
  },
  spacing: 8,
  shape: {
    borderRadius: designTokens.radius.md,
  },
  shadows: [
    "none",
    "0 1px 2px rgba(61, 46, 34, 0.04)",
    "0 2px 8px rgba(61, 46, 34, 0.06)",
    designTokens.shadow.card,
    "0 16px 40px rgba(61, 46, 34, 0.1)",
    designTokens.shadow.dialog,
    "0 24px 72px rgba(61, 46, 34, 0.18)",
    "0 28px 80px rgba(61, 46, 34, 0.2)",
    "0 32px 88px rgba(61, 46, 34, 0.22)",
    "0 36px 96px rgba(61, 46, 34, 0.24)",
    "0 40px 104px rgba(61, 46, 34, 0.26)",
    "0 44px 112px rgba(61, 46, 34, 0.28)",
    "0 48px 120px rgba(61, 46, 34, 0.3)",
    "0 52px 128px rgba(61, 46, 34, 0.32)",
    "0 56px 136px rgba(61, 46, 34, 0.34)",
    "0 60px 144px rgba(61, 46, 34, 0.36)",
    "0 64px 152px rgba(61, 46, 34, 0.38)",
    "0 68px 160px rgba(61, 46, 34, 0.4)",
    "0 72px 168px rgba(61, 46, 34, 0.42)",
    "0 76px 176px rgba(61, 46, 34, 0.44)",
    "0 80px 184px rgba(61, 46, 34, 0.46)",
    "0 84px 192px rgba(61, 46, 34, 0.48)",
    "0 88px 200px rgba(61, 46, 34, 0.5)",
    "0 92px 208px rgba(61, 46, 34, 0.52)",
    "0 96px 216px rgba(61, 46, 34, 0.54)",
  ],
  zIndex: {
    modal: appZIndex.dialog,
    snackbar: appZIndex.snackbar,
    tooltip: appZIndex.tooltip,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: designTokens.color.background.app,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${designTokens.color.border.subtle}`,
          borderRadius: designTokens.radius.lg,
          boxShadow: designTokens.shadow.card,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          minHeight: 40,
        },
        contained: {
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          ...typographyStyles.chipBadge,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          ...typographyStyles.formLabel,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          backgroundColor: designTokens.color.background.paper,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          zIndex: appZIndex.dropdown,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.radius.lg,
          boxShadow: designTokens.shadow.dialog,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: designTokens.radius.lg,
        },
      },
    },
  },
});
