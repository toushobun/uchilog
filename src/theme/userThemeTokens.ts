export const userThemeKeys = [
  "amberWarmth",
  "lavenderDream",
  "emeraldMorning",
  "sakuraStory",
  "deepSeaStarlight",
  "flameRed",
] as const;

export type UserThemeKey = (typeof userThemeKeys)[number];
export type UserThemeMode = "light" | "dark" | "system";

type LightUserThemeMode = Extract<UserThemeMode, "light">;

type KuraThemePalette = {
  page: string;
  pageGradientFrom: string;
  pageGradientTo: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  cardElevated: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentLight: string;
  accentDeep: string;
  accentPale: string;
  accentSoft: string;
  shadow: string;
};

type KuraThemeSemantic = {
  income: string;
  incomeBg: string;
  expense: string;
  expenseBg: string;
  transfer: string;
  transferBg: string;
  warning: string;
  warningBg: string;
  success: string;
  successBg: string;
  disabled: string;
  disabledBg: string;
  neutral: string;
  neutralBg: string;
};

type KuraThemeComponent = {
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  segmentBg: string;
  segmentSelectedBg: string;
  segmentSelectedText: string;
  iconBadgeBg: string;
  iconBadgeText: string;
  receiptBg: string;
  receiptTearBg: string;
};

type KuraThemeIllustration = {
  mascotAccent: string;
  accessory: string;
  decoration: string;
  backgroundPattern: string;
};

export type KuraThemeToken = {
  key: UserThemeKey;
  name: string;
  mode: LightUserThemeMode;
  palette: KuraThemePalette;
  semantic: KuraThemeSemantic;
  component: KuraThemeComponent;
  illustration: KuraThemeIllustration;
};

type BaseKuraThemeToken = {
  name: string;
  palette: Omit<
    KuraThemePalette,
    "cardElevated" | "divider" | "accentSoft" | "shadow"
  >;
};

export const defaultUserThemeKey = "amberWarmth" satisfies UserThemeKey;

const semanticTokens = {
  income: "#42A87A",
  incomeBg: "#E8F5F0",
  expense: "#E8547A",
  expenseBg: "#FDE8EE",
  transfer: "#2E6DAA",
  transferBg: "#E4F0FA",
  warning: "#B7791F",
  warningBg: "#FFF3D6",
  success: "#2F855A",
  successBg: "#DDF3E8",
  disabled: "#B0A090",
  disabledBg: "#EDE5DC",
  neutral: "#7A6A5E",
  neutralBg: "#F7EFE5",
} satisfies KuraThemeSemantic;

const baseThemeTokens = {
  amberWarmth: {
    name: "琥珀暖阳",
    palette: {
      page: "#FDF8F0",
      pageGradientFrom: "#FEF3DC",
      pageGradientTo: "#FDF8F0",
      surface: "#FFFDF8",
      surfaceAlt: "#F7EFE5",
      card: "#FFFDF8",
      border: "rgba(200, 185, 168, 0.45)",
      text: "#3D2E22",
      textMuted: "#7A6A5E",
      textFaint: "#B0A090",
      accent: "#E8930A",
      accentLight: "#F5A535",
      accentDeep: "#C47A08",
      accentPale: "#FEF3DC",
    },
  },
  lavenderDream: {
    name: "薰衣草梦境",
    palette: {
      page: "#FBF8FF",
      pageGradientFrom: "#F3EFFC",
      pageGradientTo: "#FBF8FF",
      surface: "#FFFDFE",
      surfaceAlt: "#F1ECFA",
      card: "#FFFDFE",
      border: "rgba(185, 171, 210, 0.42)",
      text: "#362C3F",
      textMuted: "#756981",
      textFaint: "#AEA0BD",
      accent: "#8A72CC",
      accentLight: "#B09EE0",
      accentDeep: "#6850BB",
      accentPale: "#EEE8F8",
    },
  },
  emeraldMorning: {
    name: "翡翠晨露",
    palette: {
      page: "#F6FCF9",
      pageGradientFrom: "#E8F5F0",
      pageGradientTo: "#F6FCF9",
      surface: "#FFFDF8",
      surfaceAlt: "#E4F3EC",
      card: "#FFFDF8",
      border: "rgba(165, 195, 181, 0.42)",
      text: "#263A32",
      textMuted: "#637A70",
      textFaint: "#9EB3AA",
      accent: "#3A9178",
      accentLight: "#5BBB9B",
      accentDeep: "#2D7A60",
      accentPale: "#E0F2EC",
    },
  },
  sakuraStory: {
    name: "粉樱物语",
    palette: {
      page: "#FFF8FA",
      pageGradientFrom: "#FDECF2",
      pageGradientTo: "#FFF8FA",
      surface: "#FFFDFE",
      surfaceAlt: "#FCECF2",
      card: "#FFFDFE",
      border: "rgba(214, 174, 187, 0.42)",
      text: "#402D35",
      textMuted: "#806A72",
      textFaint: "#B89FA8",
      accent: "#D96D8C",
      accentLight: "#F3A6BA",
      accentDeep: "#B94D70",
      accentPale: "#FDECF2",
    },
  },
  deepSeaStarlight: {
    name: "深海星光",
    palette: {
      page: "#F6FAFE",
      pageGradientFrom: "#E6F1FB",
      pageGradientTo: "#F6FAFE",
      surface: "#FFFDF8",
      surfaceAlt: "#EAF2FA",
      card: "#FFFDF8",
      border: "rgba(164, 187, 210, 0.42)",
      text: "#263544",
      textMuted: "#627384",
      textFaint: "#9DAEC0",
      accent: "#4A90D9",
      accentLight: "#88BBEE",
      accentDeep: "#2E6DAA",
      accentPale: "#E6F1FB",
    },
  },
  flameRed: {
    name: "烈焰赤红",
    palette: {
      page: "#FFF8F5",
      pageGradientFrom: "#FEEEEA",
      pageGradientTo: "#FFF8F5",
      surface: "#FFFDF8",
      surfaceAlt: "#FCE8E2",
      card: "#FFFDF8",
      border: "rgba(218, 174, 160, 0.42)",
      text: "#402A24",
      textMuted: "#80665F",
      textFaint: "#B89B92",
      accent: "#D84530",
      accentLight: "#E87060",
      accentDeep: "#B83324",
      accentPale: "#FEEEEA",
    },
  },
} as const satisfies Record<UserThemeKey, BaseKuraThemeToken>;

export const userThemeTokens = createUserThemeTokens();

function createUserThemeTokens() {
  return Object.fromEntries(
    userThemeKeys.map((key) => [
      key,
      createKuraThemeToken(key, baseThemeTokens[key]),
    ]),
  ) as Record<UserThemeKey, KuraThemeToken>;
}

function createKuraThemeToken(
  key: UserThemeKey,
  baseToken: BaseKuraThemeToken,
): KuraThemeToken {
  const { palette } = baseToken;
  const fullPalette: KuraThemePalette = {
    ...palette,
    cardElevated: palette.card,
    divider: palette.border,
    accentSoft: palette.accentPale,
    shadow: createAlphaColor(palette.text, 0.08),
  };

  return {
    key,
    name: baseToken.name,
    mode: "light",
    palette: fullPalette,
    semantic: semanticTokens,
    component: {
      buttonPrimaryBg: createAccentGradient(palette),
      buttonPrimaryText: "#FFFFFF",
      buttonSecondaryBg: palette.accentPale,
      buttonSecondaryText: palette.accentDeep,
      segmentBg: palette.surfaceAlt,
      segmentSelectedBg: palette.card,
      segmentSelectedText: palette.accent,
      iconBadgeBg: palette.accentPale,
      iconBadgeText: palette.accentDeep,
      receiptBg: palette.card,
      receiptTearBg: palette.page,
    },
    illustration: {
      mascotAccent: palette.accent,
      accessory: palette.accentLight,
      decoration: palette.accentPale,
      backgroundPattern: palette.accentPale,
    },
  };
}

function createAccentGradient(
  palette: Pick<KuraThemePalette, "accent" | "accentLight">,
) {
  return `linear-gradient(135deg, ${palette.accentLight}, ${palette.accent})`;
}

export function createAlphaColor(hexColor: string, opacity: number) {
  const normalizedHex = hexColor.replace("#", "");

  if (!/^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalizedHex)) {
    throw new Error(`Invalid hex color: ${hexColor}`);
  }

  const fullHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalizedHex;
  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function isUserThemeKey(value: string): value is UserThemeKey {
  return userThemeKeys.includes(value as UserThemeKey);
}
