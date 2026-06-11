import type { ThemeColorKey } from "theme/themeColorTokens";

export const accountTypeOptions = [
  { label: "现金", value: "cash" },
  { label: "银行账户", value: "bank" },
  { label: "信用卡", value: "credit_card" },
  { label: "电子钱包", value: "e_money" },
  { label: "其他", value: "other" },
] as const;

export type AccountType = (typeof accountTypeOptions)[number]["value"];

export type AccountHolderRole = "owner" | "co_owner";

export type AccountHolderRow = {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  display_color: ThemeColorKey;
  role: AccountHolderRole;
  // Supabase numeric may be returned as string to avoid precision loss.
  share_ratio: number | string | null;
};

export type AccountHolderOption = {
  user_id: string;
  display_name: string;
  email: string | null;
};

export type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  // Supabase numeric may be returned as string to avoid precision loss.
  initial_balance: number | string;
  current_balance: number | string;
  sort_order: number;
  created_at: string;
  holders: AccountHolderRow[];
};

export type AccountHolderRecord = {
  id: string;
  account_id: string;
  user_id: string;
  role: AccountHolderRole;
  share_ratio: number | string | null;
};

export type AppUserRecord = {
  id: string;
  display_name: string;
  email: string | null;
  status: string;
};

export type LedgerMemberRecord = {
  user_id: string;
  joined_at: string | null;
  created_at: string;
};

export type LedgerMemberDisplaySettingRecord = {
  user_id: string;
  display_color: string;
};
