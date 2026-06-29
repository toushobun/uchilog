export type TransactionBusinessBadgeStatus = "business" | "excluded";

type TransactionBusinessBadgeConfig = {
  backgroundColor: string;
  color: string;
  label: string;
};

export const transactionBusinessBadgeConfig = {
  business: {
    backgroundColor: "var(--user-theme-business-pending-bg)",
    color: "var(--user-theme-business-pending-text)",
    label: "业务",
  },
  excluded: {
    backgroundColor: "var(--user-theme-business-excluded-bg)",
    color: "var(--user-theme-business-excluded-text)",
    label: "不计入统计",
  },
} as const satisfies Record<
  TransactionBusinessBadgeStatus,
  TransactionBusinessBadgeConfig
>;
