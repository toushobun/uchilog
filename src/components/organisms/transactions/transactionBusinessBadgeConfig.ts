export type TransactionBusinessBadgeStatus =
  | "pendingReimbursement"
  | "pendingRefund"
  | "reimbursed"
  | "refunded"
  | "excluded";

type TransactionBusinessBadgeConfig = {
  backgroundColor: string;
  color: string;
  label: string;
};

export const transactionBusinessBadgeConfig = {
  pendingReimbursement: {
    backgroundColor: "var(--user-theme-business-pending-bg)",
    color: "var(--user-theme-business-pending-text)",
    label: "待报销",
  },
  pendingRefund: {
    backgroundColor: "var(--user-theme-business-refund-bg)",
    color: "var(--user-theme-business-refund-text)",
    label: "待退款",
  },
  reimbursed: {
    backgroundColor: "var(--user-theme-business-completed-bg)",
    color: "var(--user-theme-business-completed-text)",
    label: "已报销",
  },
  refunded: {
    backgroundColor: "var(--user-theme-business-completed-bg)",
    color: "var(--user-theme-business-completed-text)",
    label: "已退款",
  },
  excluded: {
    backgroundColor: "var(--user-theme-business-excluded-bg)",
    color: "var(--user-theme-business-excluded-text)",
    label: "不计入支出",
  },
} as const satisfies Record<
  TransactionBusinessBadgeStatus,
  TransactionBusinessBadgeConfig
>;
