import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  type KuraThemeToken,
  userThemeKeys,
  userThemeTokens,
} from "./userThemeTokens";

function KuraThemeTokensPreview() {
  return <ThemePaletteList />;
}

const meta = {
  title: "Theme/KuraThemeTokens",
  component: KuraThemeTokensPreview,
} satisfies Meta<typeof KuraThemeTokensPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const paletteKeys = [
  "page",
  "surface",
  "surfaceAlt",
  "card",
  "accent",
  "accentPale",
  "text",
  "textMuted",
] as const;

const semanticPairs = [
  ["income", "incomeBg"],
  ["expense", "expenseBg"],
  ["transfer", "transferBg"],
  ["warning", "warningBg"],
  ["success", "successBg"],
  ["disabled", "disabledBg"],
  ["neutral", "neutralBg"],
] as const;

function createPageGradient(token: KuraThemeToken) {
  const { pageGradientFrom, pageGradientTo } = token.palette;

  return `linear-gradient(180deg, ${pageGradientFrom}, ${pageGradientTo})`;
}

function ColorChip({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 96 }}>
      <Box
        sx={{
          bgcolor: value,
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: 1.5,
          height: 32,
        }}
      />
      <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{label}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: 10 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ThemePaletteList() {
  return (
    <Stack spacing={3}>
      {userThemeKeys.map((themeKey) => {
        const token = userThemeTokens[themeKey];

        return (
          <Stack
            key={themeKey}
            spacing={2}
            sx={{
              background: createPageGradient(token),
              border: `1px solid ${token.palette.border}`,
              borderRadius: 3,
              boxShadow: `0 10px 24px ${token.palette.shadow}`,
              p: 2,
            }}
          >
            <Stack spacing={0.5}>
              <Typography sx={{ color: token.palette.text, fontWeight: 800 }}>
                {token.name}
              </Typography>
              <Typography sx={{ color: token.palette.textMuted, fontSize: 12 }}>
                {themeKey}
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.25 }}>
              {paletteKeys.map((paletteKey) => (
                <ColorChip
                  key={paletteKey}
                  label={paletteKey}
                  value={token.palette[paletteKey]}
                />
              ))}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}

function SemanticColorList() {
  // semantic tokens 在所有个人主题中共享，这里仅用默认主题作为代表来源。
  const token = userThemeTokens.amberWarmth;

  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.25 }}>
      {semanticPairs.map(([colorKey, bgKey]) => (
        <Stack key={colorKey} spacing={1} sx={{ minWidth: 132 }}>
          <ColorChip label={colorKey} value={token.semantic[colorKey]} />
          <ColorChip label={bgKey} value={token.semantic[bgKey]} />
        </Stack>
      ))}
    </Stack>
  );
}

export const Themes: Story = {
  name: "6 款主题色盘",
  render: () => <ThemePaletteList />,
};

export const SemanticColors: Story = {
  name: "共通语义色",
  render: () => <SemanticColorList />,
};
