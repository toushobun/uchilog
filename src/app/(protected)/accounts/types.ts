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

export function getAccountTypeLabel(type: string) {
  return (
    accountTypeOptions.find((option) => option.value === type)?.label ?? "其他"
  );
}

export function getAccountHolderLabel({
  display_name,
  email,
}: {
  display_name: string;
  email: string | null;
}) {
  return display_name || email || "名称未设置";
}

export function formatAmount(amount: number | string | null, currency: string) {
  if (amount === null) {
    return `-- ${currency}`;
  }

  const numberAmount = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(numberAmount)) {
    return `${amount} ${currency}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      currency,
      style: "currency",
    }).format(numberAmount);
  } catch {
    return `${numberAmount} ${currency}`;
  }
}
