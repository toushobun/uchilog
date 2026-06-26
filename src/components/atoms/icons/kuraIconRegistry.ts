export type KuraIconEntry = {
  src: string;
  /** 默认无障碍标签 */
  label: string;
};

export const KURA_ICON_NAMES = [
  "home",
  "transactions",
  "quickRecord",
  "statistics",
  "profile",
  "account",
  "category",
  "tag",
  "merchant",
  "settings",
] as const;

export type KuraIconName = (typeof KURA_ICON_NAMES)[number];

export const kuraIconRegistry: Record<KuraIconName, KuraIconEntry> = {
  account: {
    label: "账户",
    src: "/assets/kura-icons/account.png",
  },
  category: {
    label: "分类",
    src: "/assets/kura-icons/category.png",
  },
  home: {
    label: "首页",
    src: "/assets/kura-icons/home.png",
  },
  merchant: {
    label: "商家",
    src: "/assets/kura-icons/merchant.png",
  },
  profile: {
    label: "我的",
    src: "/assets/kura-icons/profile.png",
  },
  quickRecord: {
    label: "记一笔",
    src: "/assets/kura-icons/quick-record.png",
  },
  settings: {
    label: "设置",
    src: "/assets/kura-icons/settings.png",
  },
  statistics: {
    label: "统计",
    src: "/assets/kura-icons/statistics.png",
  },
  tag: {
    label: "标签",
    src: "/assets/kura-icons/tag.png",
  },
  transactions: {
    label: "明细",
    src: "/assets/kura-icons/transactions.png",
  },
};
