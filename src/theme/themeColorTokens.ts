export const themeColorKeys = [
  "jade",
  "aqua",
  "sky",
  "indigo",
  "lavender",
  "magenta",
  "sakura",
  "rose",
  "amber",
  "lime",
] as const;

export type ThemeColorKey = (typeof themeColorKeys)[number];

type ThemeColorToken = {
  label: string;
  accent: string;
  accentSoft: string;
  backgroundGradient: {
    from: string;
    via: string;
    to: string;
  };
  surface: string;
  surfaceBorder: string;
  itemBackground: string;
  itemBorder: string;
  chipBackground: string;
  chipBorder: string;
  chipText: string;
};

export const themeColorTokens: Record<ThemeColorKey, ThemeColorToken> = {
  jade: {
    label: "翡翠绿",
    accent: "#22a878",
    accentSoft: "#dff8eb",
    backgroundGradient: {
      from: "#eefbf4",
      via: "#d9f5ea",
      to: "#f9fbef",
    },
    surface: "rgba(248, 255, 251, 0.86)",
    surfaceBorder: "rgba(34, 168, 120, 0.28)",
    itemBackground: "#effbf6",
    itemBorder: "#b8ead6",
    chipBackground: "#e6f8ef",
    chipBorder: "#91d9bf",
    chipText: "#17664d",
  },
  aqua: {
    label: "青碧",
    accent: "#20a9b1",
    accentSoft: "#dff8f8",
    backgroundGradient: {
      from: "#f0fbfb",
      via: "#dcf7f5",
      to: "#edf8ff",
    },
    surface: "rgba(248, 255, 255, 0.86)",
    surfaceBorder: "rgba(32, 169, 177, 0.27)",
    itemBackground: "#edfafa",
    itemBorder: "#b5e7e6",
    chipBackground: "#e4f7f8",
    chipBorder: "#8ad7db",
    chipText: "#17656a",
  },
  sky: {
    label: "天空蓝",
    accent: "#3f9ff4",
    accentSoft: "#e4f2ff",
    backgroundGradient: {
      from: "#f3f9ff",
      via: "#e3f1ff",
      to: "#f1f8ff",
    },
    surface: "rgba(249, 253, 255, 0.86)",
    surfaceBorder: "rgba(63, 159, 244, 0.27)",
    itemBackground: "#eef7ff",
    itemBorder: "#bddfff",
    chipBackground: "#e8f4ff",
    chipBorder: "#9acfff",
    chipText: "#1f5f9e",
  },
  indigo: {
    label: "靛青",
    accent: "#6977d8",
    accentSoft: "#eceeff",
    backgroundGradient: {
      from: "#f5f6ff",
      via: "#eceeff",
      to: "#f5f2ff",
    },
    surface: "rgba(250, 250, 255, 0.86)",
    surfaceBorder: "rgba(105, 119, 216, 0.27)",
    itemBackground: "#f1f2ff",
    itemBorder: "#c9cef8",
    chipBackground: "#edefff",
    chipBorder: "#adb6f0",
    chipText: "#3f4c9a",
  },
  lavender: {
    label: "薰衣草",
    accent: "#9a78df",
    accentSoft: "#f1ebff",
    backgroundGradient: {
      from: "#f8f5ff",
      via: "#f0e9ff",
      to: "#fff5fb",
    },
    surface: "rgba(253, 250, 255, 0.86)",
    surfaceBorder: "rgba(154, 120, 223, 0.27)",
    itemBackground: "#f7f1ff",
    itemBorder: "#d8c5f7",
    chipBackground: "#f2ebff",
    chipBorder: "#c6a9ef",
    chipText: "#65419e",
  },
  magenta: {
    label: "玫紫",
    accent: "#c86ac5",
    accentSoft: "#fae9f8",
    backgroundGradient: {
      from: "#fff5fc",
      via: "#fae9f8",
      to: "#f6f0ff",
    },
    surface: "rgba(255, 250, 254, 0.86)",
    surfaceBorder: "rgba(200, 106, 197, 0.27)",
    itemBackground: "#fff0fb",
    itemBorder: "#edbde8",
    chipBackground: "#faeaf8",
    chipBorder: "#df9cda",
    chipText: "#863680",
  },
  sakura: {
    label: "粉樱",
    accent: "#f27fa6",
    accentSoft: "#ffeaf1",
    backgroundGradient: {
      from: "#fff7fa",
      via: "#ffeaf1",
      to: "#fff4e9",
    },
    surface: "rgba(255, 251, 253, 0.88)",
    surfaceBorder: "rgba(242, 127, 166, 0.27)",
    itemBackground: "#fff2f6",
    itemBorder: "#f7bfd0",
    chipBackground: "#ffeaf1",
    chipBorder: "#efa4bd",
    chipText: "#9b3d5e",
  },
  rose: {
    label: "玫瑰红",
    accent: "#e5576c",
    accentSoft: "#ffe8ec",
    backgroundGradient: {
      from: "#fff5f7",
      via: "#ffe8ec",
      to: "#fff2ef",
    },
    surface: "rgba(255, 250, 250, 0.88)",
    surfaceBorder: "rgba(229, 87, 108, 0.27)",
    itemBackground: "#fff0f2",
    itemBorder: "#f4b5bf",
    chipBackground: "#ffe8ec",
    chipBorder: "#e996a4",
    chipText: "#8e2e3f",
  },
  amber: {
    label: "琥珀橙",
    accent: "#e9a13a",
    accentSoft: "#fff1d9",
    backgroundGradient: {
      from: "#fffaf1",
      via: "#fff1d9",
      to: "#fff7ea",
    },
    surface: "rgba(255, 253, 248, 0.88)",
    surfaceBorder: "rgba(233, 161, 58, 0.28)",
    itemBackground: "#fff7e8",
    itemBorder: "#efcc8b",
    chipBackground: "#fff1d9",
    chipBorder: "#e3b86d",
    chipText: "#7a541f",
  },
  lime: {
    label: "青柠",
    accent: "#9bcf3e",
    accentSoft: "#eff9d6",
    backgroundGradient: {
      from: "#fbfff1",
      via: "#eff9d6",
      to: "#f2fbeb",
    },
    surface: "rgba(253, 255, 247, 0.88)",
    surfaceBorder: "rgba(155, 207, 62, 0.3)",
    itemBackground: "#f7fde8",
    itemBorder: "#cfe98d",
    chipBackground: "#eff9d6",
    chipBorder: "#b6dc69",
    chipText: "#526f1f",
  },
};

export function isThemeColorKey(value: string): value is ThemeColorKey {
  return themeColorKeys.includes(value as ThemeColorKey);
}

export function getFallbackThemeColorKey(index: number): ThemeColorKey {
  return themeColorKeys[index % themeColorKeys.length];
}

export function getStableFallbackThemeColorKey(seed: string): ThemeColorKey {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return getFallbackThemeColorKey(hash);
}
