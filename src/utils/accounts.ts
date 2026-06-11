import { accountTypeOptions } from "types/accounts";
import type {
  AccountHolderOption,
  AccountHolderRecord,
  AccountHolderRow,
  AccountRow,
  AppUserRecord,
  LedgerMemberDisplaySettingRecord,
  LedgerMemberRecord,
} from "types/accounts";
import {
  getFallbackThemeColorKey,
  getStableFallbackThemeColorKey,
  isThemeColorKey,
  type ThemeColorKey,
} from "theme/themeColorTokens";

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
    })
      .format(numberAmount)
      .replace(/\uFFE5/g, "¥");
  } catch {
    return `${numberAmount} ${currency}`;
  }
}

export function buildAccountsWithHolders({
  accounts,
  appUserById,
  displayColorByUserId,
  holders,
}: {
  accounts: Omit<AccountRow, "holders">[];
  appUserById: Map<string, AppUserRecord>;
  displayColorByUserId: Map<string, ThemeColorKey>;
  holders: AccountHolderRecord[];
}) {
  const holdersByAccountId = new Map<string, AccountHolderRow[]>();

  for (const holder of holders) {
    const appUser = appUserById.get(holder.user_id);

    if (!appUser) {
      continue;
    }

    const accountHolders = holdersByAccountId.get(holder.account_id) ?? [];

    accountHolders.push({
      id: holder.id,
      user_id: holder.user_id,
      display_name: appUser.display_name,
      email: appUser.email,
      display_color:
        displayColorByUserId.get(holder.user_id) ??
        getStableFallbackThemeColorKey(holder.user_id),
      role: holder.role,
      share_ratio: holder.share_ratio,
    });

    holdersByAccountId.set(holder.account_id, accountHolders);
  }

  return accounts.map((account) => ({
    ...account,
    holders: holdersByAccountId.get(account.id) ?? [],
  }));
}

export function buildHolderOptions({
  appUserById,
  members,
}: {
  appUserById: Map<string, AppUserRecord>;
  members: LedgerMemberRecord[];
}) {
  return members
    .map((member): AccountHolderOption | null => {
      const appUser = appUserById.get(member.user_id);

      if (!appUser || appUser.status !== "active") {
        return null;
      }

      return {
        user_id: member.user_id,
        display_name: appUser.display_name,
        email: appUser.email,
      };
    })
    .filter((option): option is AccountHolderOption => option !== null)
    .sort((a, b) =>
      (a.display_name || a.email || "").localeCompare(
        b.display_name || b.email || "",
      ),
    );
}

export function buildDisplayColorByUserId({
  members,
  settings,
}: {
  members: LedgerMemberRecord[];
  settings: LedgerMemberDisplaySettingRecord[];
}) {
  const displayColorByUserId = new Map<string, ThemeColorKey>();
  const sortedMembers = [...members].sort((a, b) => {
    const timeCompare = (a.joined_at ?? a.created_at).localeCompare(
      b.joined_at ?? b.created_at,
    );

    return timeCompare || a.user_id.localeCompare(b.user_id);
  });

  sortedMembers.forEach((member, index) => {
    displayColorByUserId.set(member.user_id, getFallbackThemeColorKey(index));
  });

  for (const setting of settings) {
    if (isThemeColorKey(setting.display_color)) {
      displayColorByUserId.set(setting.user_id, setting.display_color);
    }
  }

  return displayColorByUserId;
}
