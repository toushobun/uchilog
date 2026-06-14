export const userThemeKeys = [
  "lavender_dream",
  "jade_morning_dew",
  "sakura_story",
  "deep_sea_starlight",
  "amber_sun",
  "rose_velvet_night",
  "flame_red",
  "lemon_gold",
  "indigo_ocean",
  "white_porcelain",
] as const;

export type UserThemeKey = (typeof userThemeKeys)[number];

export type UserThemeMode = "light" | "dark" | "system";

type UserThemeTokens = {
  label: string;
  mode: Extract<UserThemeMode, "light">;
  switcherGradient: string;
  pageBackground: string;
  statusTextColor: string;
  titleGradient: string;
  subtitleTextColor: string;
  avatar: {
    background: string;
    color: string;
  };
  balanceBadge: {
    background: string;
    color: string;
  };
  balanceTextColor: string;
  sectionTextColor: string;
  actionTextColor: string;
  budgetBarGradients: readonly [string, string, string];
  negativeAmountColor: string;
  secondaryTextColor: string;
  statValueColors: readonly [string, string];
  bottomNavigation: {
    activeColor: string;
    activeBackground: string;
    inactiveColor: string;
  };
  floatingActionButton: {
    background: string;
    shadowColor: string;
    textColor: string;
  };
  transactionText: {
    nameColor: string;
    metaColor: string;
  };
};

export const defaultUserThemeKey = "lavender_dream" satisfies UserThemeKey;

export const userThemeTokens: Record<UserThemeKey, UserThemeTokens> = {
  lavender_dream: {
    label: "薰衣草梦境",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #c4b5fd, #f9a8d4)",
    pageBackground:
      "linear-gradient(155deg, #b8f0e0 0%, #d4c8f8 32%, #f8d6e8 64%, #fce8c8 100%)",
    statusTextColor: "rgba(80, 60, 100, 0.75)",
    titleGradient: "linear-gradient(120deg, #8b5cf6, #ec4899, #f59e0b)",
    subtitleTextColor: "rgba(90, 70, 120, 0.65)",
    avatar: {
      background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)",
      color: "#6d28d9",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #c4b5fd, #a78bfa)",
      color: "#4c1d95",
    },
    balanceTextColor: "#3d2260",
    sectionTextColor: "rgba(70, 50, 100, 0.7)",
    actionTextColor: "#a78bfa",
    budgetBarGradients: [
      "linear-gradient(90deg, #f9a8d4, #ec4899)",
      "linear-gradient(90deg, #c4b5fd, #8b5cf6)",
      "linear-gradient(90deg, #6ee7b7, #34d399)",
    ],
    negativeAmountColor: "#7c3aed",
    secondaryTextColor: "rgba(80, 60, 100, 0.55)",
    statValueColors: ["#7c3aed", "#db2777"],
    bottomNavigation: {
      activeColor: "#7c3aed",
      activeBackground: "rgba(167, 139, 250, 0.18)",
      inactiveColor: "rgba(100, 80, 140, 0.5)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #a78bfa, #ec4899)",
      shadowColor: "rgba(167, 139, 250, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#3d2260",
      metaColor: "rgba(80, 60, 100, 0.5)",
    },
  },
  jade_morning_dew: {
    label: "翡翠晨露",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #6ee7b7, #22d3ee)",
    pageBackground:
      "linear-gradient(155deg, #fce7f3 0%, #d1fae5 28%, #cffafe 58%, #e0f2fe 100%)",
    statusTextColor: "rgba(6, 78, 59, 0.75)",
    titleGradient: "linear-gradient(120deg, #059669, #0891b2, #6ee7b7)",
    subtitleTextColor: "rgba(6, 78, 59, 0.6)",
    avatar: {
      background: "linear-gradient(135deg, #6ee7b7, #22d3ee)",
      color: "#065f46",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #6ee7b7, #34d399)",
      color: "#064e3b",
    },
    balanceTextColor: "#064e3b",
    sectionTextColor: "rgba(6, 60, 50, 0.7)",
    actionTextColor: "#059669",
    budgetBarGradients: [
      "linear-gradient(90deg, #6ee7b7, #34d399)",
      "linear-gradient(90deg, #67e8f9, #22d3ee)",
      "linear-gradient(90deg, #fda4af, #fb7185)",
    ],
    negativeAmountColor: "#0e7490",
    secondaryTextColor: "rgba(6, 60, 50, 0.55)",
    statValueColors: ["#059669", "#0891b2"],
    bottomNavigation: {
      activeColor: "#059669",
      activeBackground: "rgba(110, 231, 183, 0.2)",
      inactiveColor: "rgba(6, 78, 59, 0.45)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #34d399, #22d3ee)",
      shadowColor: "rgba(52, 211, 153, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#064e3b",
      metaColor: "rgba(6, 78, 59, 0.5)",
    },
  },
  sakura_story: {
    label: "粉樱物语",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #fda4af, #f472b6)",
    pageBackground:
      "linear-gradient(155deg, #fef9c3 0%, #fecdd3 28%, #fce7f3 58%, #ede9fe 100%)",
    statusTextColor: "rgba(136, 19, 55, 0.72)",
    titleGradient: "linear-gradient(120deg, #f43f5e, #ec4899, #f9a8d4)",
    subtitleTextColor: "rgba(136, 19, 55, 0.55)",
    avatar: {
      background: "linear-gradient(135deg, #fda4af, #f9a8d4)",
      color: "#9d174d",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #fda4af, #fb7185)",
      color: "#881337",
    },
    balanceTextColor: "#881337",
    sectionTextColor: "rgba(120, 20, 50, 0.7)",
    actionTextColor: "#f43f5e",
    budgetBarGradients: [
      "linear-gradient(90deg, #fda4af, #fb7185)",
      "linear-gradient(90deg, #f9a8d4, #ec4899)",
      "linear-gradient(90deg, #a5f3fc, #22d3ee)",
    ],
    negativeAmountColor: "#be123c",
    secondaryTextColor: "rgba(136, 19, 55, 0.5)",
    statValueColors: ["#be123c", "#9d174d"],
    bottomNavigation: {
      activeColor: "#f43f5e",
      activeBackground: "rgba(253, 164, 175, 0.2)",
      inactiveColor: "rgba(136, 19, 55, 0.4)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #fb7185, #f472b6)",
      shadowColor: "rgba(251, 113, 133, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#881337",
      metaColor: "rgba(136, 19, 55, 0.48)",
    },
  },
  deep_sea_starlight: {
    label: "深海星光",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #60a5fa, #818cf8)",
    pageBackground:
      "linear-gradient(155deg, #fce7f3 0%, #dbeafe 28%, #c7d2fe 55%, #cffafe 100%)",
    statusTextColor: "rgba(30, 27, 75, 0.75)",
    titleGradient: "linear-gradient(120deg, #4f46e5, #0284c7, #22d3ee)",
    subtitleTextColor: "rgba(30, 27, 75, 0.6)",
    avatar: {
      background: "linear-gradient(135deg, #818cf8, #60a5fa)",
      color: "#312e81",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #818cf8, #6366f1)",
      color: "#1e1b4b",
    },
    balanceTextColor: "#1e1b4b",
    sectionTextColor: "rgba(30, 27, 75, 0.7)",
    actionTextColor: "#6366f1",
    budgetBarGradients: [
      "linear-gradient(90deg, #818cf8, #6366f1)",
      "linear-gradient(90deg, #60a5fa, #3b82f6)",
      "linear-gradient(90deg, #f9a8d4, #ec4899)",
    ],
    negativeAmountColor: "#4338ca",
    secondaryTextColor: "rgba(30, 27, 75, 0.5)",
    statValueColors: ["#4338ca", "#1d4ed8"],
    bottomNavigation: {
      activeColor: "#4f46e5",
      activeBackground: "rgba(129, 140, 248, 0.2)",
      inactiveColor: "rgba(30, 27, 75, 0.45)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
      shadowColor: "rgba(99, 102, 241, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#1e1b4b",
      metaColor: "rgba(30, 27, 75, 0.48)",
    },
  },
  amber_sun: {
    label: "琥珀暖阳",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #fbbf24, #fb923c)",
    pageBackground:
      "linear-gradient(155deg, #d1fae5 0%, #fef3c7 30%, #ffedd5 58%, #fce7f3 100%)",
    statusTextColor: "rgba(120, 53, 15, 0.75)",
    titleGradient: "linear-gradient(120deg, #d97706, #ea580c, #fbbf24)",
    subtitleTextColor: "rgba(120, 53, 15, 0.6)",
    avatar: {
      background: "linear-gradient(135deg, #fcd34d, #fb923c)",
      color: "#78350f",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #fcd34d, #fbbf24)",
      color: "#78350f",
    },
    balanceTextColor: "#78350f",
    sectionTextColor: "rgba(100, 45, 10, 0.7)",
    actionTextColor: "#d97706",
    budgetBarGradients: [
      "linear-gradient(90deg, #fcd34d, #fbbf24)",
      "linear-gradient(90deg, #fb923c, #f97316)",
      "linear-gradient(90deg, #a7f3d0, #34d399)",
    ],
    negativeAmountColor: "#b45309",
    secondaryTextColor: "rgba(120, 53, 15, 0.5)",
    statValueColors: ["#b45309", "#c2410c"],
    bottomNavigation: {
      activeColor: "#d97706",
      activeBackground: "rgba(251, 191, 36, 0.2)",
      inactiveColor: "rgba(120, 53, 15, 0.4)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #fbbf24, #fb923c)",
      shadowColor: "rgba(251, 191, 36, 0.5)",
      textColor: "#78350f",
    },
    transactionText: {
      nameColor: "#78350f",
      metaColor: "rgba(120, 53, 15, 0.48)",
    },
  },
  rose_velvet_night: {
    label: "玫瑰绒夜",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #e879f9, #db2777)",
    pageBackground:
      "linear-gradient(155deg, #cffafe 0%, #fae8ff 28%, #fce7f3 55%, #ede9fe 100%)",
    statusTextColor: "rgba(88, 28, 135, 0.75)",
    titleGradient: "linear-gradient(120deg, #c026d3, #db2777, #a855f7)",
    subtitleTextColor: "rgba(88, 28, 135, 0.6)",
    avatar: {
      background: "linear-gradient(135deg, #e879f9, #a855f7)",
      color: "#581c87",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #e879f9, #c026d3)",
      color: "#3b0764",
    },
    balanceTextColor: "#3b0764",
    sectionTextColor: "rgba(74, 20, 120, 0.7)",
    actionTextColor: "#c026d3",
    budgetBarGradients: [
      "linear-gradient(90deg, #e879f9, #c026d3)",
      "linear-gradient(90deg, #f472b6, #db2777)",
      "linear-gradient(90deg, #67e8f9, #22d3ee)",
    ],
    negativeAmountColor: "#86198f",
    secondaryTextColor: "rgba(88, 28, 135, 0.5)",
    statValueColors: ["#86198f", "#9d174d"],
    bottomNavigation: {
      activeColor: "#c026d3",
      activeBackground: "rgba(232, 121, 249, 0.18)",
      inactiveColor: "rgba(88, 28, 135, 0.45)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #e879f9, #db2777)",
      shadowColor: "rgba(232, 121, 249, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#3b0764",
      metaColor: "rgba(88, 28, 135, 0.48)",
    },
  },
  flame_red: {
    label: "烈焰赤红",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #f87171, #ef4444)",
    pageBackground:
      "linear-gradient(155deg, #fef9c3 0%, #fee2e2 30%, #fecdd3 58%, #ffedd5 100%)",
    statusTextColor: "rgba(127, 29, 29, 0.78)",
    titleGradient: "linear-gradient(120deg, #dc2626, #f97316, #f87171)",
    subtitleTextColor: "rgba(127, 29, 29, 0.62)",
    avatar: {
      background: "linear-gradient(135deg, #f87171, #fca5a5)",
      color: "#7f1d1d",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #f87171, #ef4444)",
      color: "#7f1d1d",
    },
    balanceTextColor: "#7f1d1d",
    sectionTextColor: "rgba(110, 20, 20, 0.72)",
    actionTextColor: "#dc2626",
    budgetBarGradients: [
      "linear-gradient(90deg, #f87171, #ef4444)",
      "linear-gradient(90deg, #fca5a5, #f87171)",
      "linear-gradient(90deg, #fcd34d, #fbbf24)",
    ],
    negativeAmountColor: "#b91c1c",
    secondaryTextColor: "rgba(127, 29, 29, 0.52)",
    statValueColors: ["#b91c1c", "#c2410c"],
    bottomNavigation: {
      activeColor: "#dc2626",
      activeBackground: "rgba(248, 113, 113, 0.18)",
      inactiveColor: "rgba(127, 29, 29, 0.42)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #ef4444, #f97316)",
      shadowColor: "rgba(239, 68, 68, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#7f1d1d",
      metaColor: "rgba(127, 29, 29, 0.5)",
    },
  },
  lemon_gold: {
    label: "柠光金黄",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #facc15, #84cc16)",
    pageBackground:
      "linear-gradient(155deg, #cffafe 0%, #fef08a 28%, #d9f99d 55%, #fce7f3 100%)",
    statusTextColor: "rgba(85, 65, 0, 0.78)",
    titleGradient: "linear-gradient(120deg, #ca8a04, #65a30d, #facc15)",
    subtitleTextColor: "rgba(85, 65, 0, 0.62)",
    avatar: {
      background: "linear-gradient(135deg, #fde047, #a3e635)",
      color: "#713f12",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #fde047, #facc15)",
      color: "#713f12",
    },
    balanceTextColor: "#713f12",
    sectionTextColor: "rgba(70, 55, 0, 0.72)",
    actionTextColor: "#ca8a04",
    budgetBarGradients: [
      "linear-gradient(90deg, #fde047, #facc15)",
      "linear-gradient(90deg, #a3e635, #84cc16)",
      "linear-gradient(90deg, #67e8f9, #22d3ee)",
    ],
    negativeAmountColor: "#a16207",
    secondaryTextColor: "rgba(85, 65, 0, 0.52)",
    statValueColors: ["#a16207", "#4d7c0f"],
    bottomNavigation: {
      activeColor: "#ca8a04",
      activeBackground: "rgba(253, 224, 71, 0.22)",
      inactiveColor: "rgba(85, 65, 0, 0.42)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #facc15, #84cc16)",
      shadowColor: "rgba(250, 204, 21, 0.5)",
      textColor: "#713f12",
    },
    transactionText: {
      nameColor: "#713f12",
      metaColor: "rgba(85, 65, 0, 0.5)",
    },
  },
  indigo_ocean: {
    label: "靛海深蓝",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    pageBackground:
      "linear-gradient(155deg, #fce7f3 0%, #bfdbfe 28%, #c7d2fe 55%, #a5f3fc 100%)",
    statusTextColor: "rgba(15, 23, 60, 0.82)",
    titleGradient: "linear-gradient(120deg, #1d4ed8, #0369a1, #2563eb)",
    subtitleTextColor: "rgba(15, 23, 60, 0.62)",
    avatar: {
      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      color: "#1e3a8a",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #3b82f6, #2563eb)",
      color: "#1e3a8a",
    },
    balanceTextColor: "#1e3a8a",
    sectionTextColor: "rgba(15, 23, 60, 0.74)",
    actionTextColor: "#2563eb",
    budgetBarGradients: [
      "linear-gradient(90deg, #60a5fa, #2563eb)",
      "linear-gradient(90deg, #38bdf8, #0284c7)",
      "linear-gradient(90deg, #f9a8d4, #ec4899)",
    ],
    negativeAmountColor: "#1d4ed8",
    secondaryTextColor: "rgba(15, 23, 60, 0.52)",
    statValueColors: ["#1d4ed8", "#075985"],
    bottomNavigation: {
      activeColor: "#2563eb",
      activeBackground: "rgba(59, 130, 246, 0.18)",
      inactiveColor: "rgba(15, 23, 60, 0.42)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #2563eb, #0284c7)",
      shadowColor: "rgba(37, 99, 235, 0.45)",
      textColor: "#ffffff",
    },
    transactionText: {
      nameColor: "#1e3a8a",
      metaColor: "rgba(15, 23, 60, 0.5)",
    },
  },
  white_porcelain: {
    label: "白瓷素雅",
    mode: "light",
    switcherGradient: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
    pageBackground:
      "linear-gradient(155deg, #f0fdf4 0%, #f1f5f9 32%, #f8fafc 62%, #fefce8 100%)",
    statusTextColor: "rgba(51, 65, 85, 0.72)",
    titleGradient: "linear-gradient(120deg, #475569, #64748b, #94a3b8)",
    subtitleTextColor: "rgba(71, 85, 105, 0.62)",
    avatar: {
      background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
      color: "#334155",
    },
    balanceBadge: {
      background: "linear-gradient(120deg, #e2e8f0, #cbd5e1)",
      color: "#334155",
    },
    balanceTextColor: "#1e293b",
    sectionTextColor: "rgba(51, 65, 85, 0.72)",
    actionTextColor: "#64748b",
    budgetBarGradients: [
      "linear-gradient(90deg, #cbd5e1, #94a3b8)",
      "linear-gradient(90deg, #d1d5db, #9ca3af)",
      "linear-gradient(90deg, #bbf7d0, #86efac)",
    ],
    negativeAmountColor: "#475569",
    secondaryTextColor: "rgba(51, 65, 85, 0.52)",
    statValueColors: ["#475569", "#334155"],
    bottomNavigation: {
      activeColor: "#475569",
      activeBackground: "rgba(148, 163, 184, 0.18)",
      inactiveColor: "rgba(100, 116, 139, 0.45)",
    },
    floatingActionButton: {
      background: "linear-gradient(135deg, #94a3b8, #64748b)",
      shadowColor: "rgba(148, 163, 184, 0.4)",
      textColor: "#1e293b",
    },
    transactionText: {
      nameColor: "#1e293b",
      metaColor: "rgba(51, 65, 85, 0.5)",
    },
  },
};

export function isUserThemeKey(value: string): value is UserThemeKey {
  return userThemeKeys.includes(value as UserThemeKey);
}
