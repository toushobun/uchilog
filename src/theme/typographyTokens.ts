export const typographyFontFamilies = {
  brand: [
    '"LXGW WenKai"',
    '"霞鹜文楷"',
    '"Klee One"',
    '"Noto Serif SC"',
    "serif",
  ].join(","),
  body: [
    '"Noto Sans SC"',
    '"PingFang SC"',
    '"Hiragino Sans GB"',
    '"Microsoft YaHei"',
    "sans-serif",
  ].join(","),
  number: ['"Nunito"', '"Noto Sans SC"', "sans-serif"].join(","),
} as const;

export const typographyStyles = {
  brandTitle: {
    fontFamily: typographyFontFamilies.brand,
    fontWeight: 700,
    letterSpacing: "0.02em",
    lineHeight: 1.25,
  },
  pageTitle: {
    fontFamily: typographyFontFamilies.brand,
    fontWeight: 700,
    letterSpacing: "0.02em",
    lineHeight: 1.3,
  },
  cardTitle: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 700,
    letterSpacing: "0.01em",
    lineHeight: 1.35,
  },
  body: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 400,
    letterSpacing: "0.01em",
    lineHeight: 1.6,
  },
  formLabel: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: 1.4,
  },
  button: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 700,
    letterSpacing: "0.03em",
    lineHeight: 1.2,
    textTransform: "none" as const,
  },
  amount: {
    fontFamily: typographyFontFamilies.number,
    fontVariantNumeric: "tabular-nums" as const,
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1.15,
  },
  chipBadge: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 600,
    letterSpacing: "0.01em",
    lineHeight: 1.2,
  },
  listText: {
    fontFamily: typographyFontFamilies.body,
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: 1.4,
  },
} as const;
