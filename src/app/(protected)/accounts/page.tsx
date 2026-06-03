import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";
import {
  getFallbackThemeColorKey,
  getStableFallbackThemeColorKey,
  isThemeColorKey,
  type ThemeColorKey,
} from "@/theme/themeColorTokens";

import { AccountForm } from "accounts/AccountForm";
import { AccountList } from "accounts/AccountList";

import { archiveAccount, createAccount, updateAccount } from "./actions";
import type {
  AccountHolderOption,
  AccountHolderRole,
  AccountHolderRow,
  AccountRow,
} from "./types";

type AccountsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

type AccountHolderRecord = {
  id: string;
  account_id: string;
  user_id: string;
  role: AccountHolderRole;
  share_ratio: number | string | null;
};

type AppUserRecord = {
  id: string;
  display_name: string;
  email: string | null;
  status: string;
};

type LedgerMemberRecord = {
  user_id: string;
  joined_at: string | null;
  created_at: string;
};

type LedgerMemberDisplaySettingRecord = {
  user_id: string;
  display_color: string;
};

const errorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  archive_failed: "账户归档失败。",
  create_failed: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  update_failed: "账户更新失败。请确认账户名称是否重复，或稍后重试。",
  currency_invalid: "货币必须是 3 位大写字母，例如 JPY。",
  holder_invalid: "账户持有人指定不正确。",
  initial_balance_invalid: "初始余额必须是数字。",
  name_required: "请输入账户名称。",
  type_invalid: "账户类型不正确。",
};

function buildAccountsWithHolders({
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

function buildHolderOptions({
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

function buildDisplayColorByUserId({
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

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("account")
    .select(
      "id, name, type, currency, initial_balance, current_balance, sort_order, created_at",
    )
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load accounts");
  }

  const accountRows = (data ?? []) as Omit<AccountRow, "holders">[];
  const accountIds = accountRows.map((account) => account.id);

  let holderRows: AccountHolderRecord[] = [];
  const appUserById = new Map<string, AppUserRecord>();

  const memberRequest = supabase
    .from("ledger_member")
    .select("user_id, joined_at, created_at")
    .eq("ledger_id", currentLedger.id)
    .eq("status", "active");

  const displaySettingRequest = supabase
    .from("ledger_member_display_setting")
    .select("user_id, display_color")
    .eq("ledger_id", currentLedger.id);

  const holderRequest =
    accountIds.length > 0
      ? supabase
          .from("account_holder")
          .select("id, account_id, user_id, role, share_ratio")
          .eq("ledger_id", currentLedger.id)
          .in("account_id", accountIds)
      : Promise.resolve({ data: [], error: null });

  const [
    { data: memberData, error: memberError },
    { data: displaySettingData, error: displaySettingError },
    { data: holderData, error: holderError },
  ] = await Promise.all([memberRequest, displaySettingRequest, holderRequest]);

  if (memberError) {
    throw new Error("Failed to load ledger members");
  }

  const memberRows = (memberData ?? []) as LedgerMemberRecord[];
  const memberUserIds = memberRows.map((member) => member.user_id);

  if (displaySettingError) {
    throw new Error("Failed to load ledger member display settings");
  }

  const displaySettingRows = (displaySettingData ??
    []) as LedgerMemberDisplaySettingRecord[];

  if (holderError) {
    throw new Error("Failed to load account holders");
  }

  holderRows = (holderData ?? []) as AccountHolderRecord[];

  const userIds = [
    ...new Set([
      ...memberUserIds,
      ...holderRows.map((holder) => holder.user_id),
    ]),
  ];

  if (userIds.length > 0) {
    const { data: appUserData, error: appUserError } = await supabase
      .from("app_user")
      .select("id, display_name, email, status")
      .in("id", userIds);

    if (appUserError) {
      throw new Error("Failed to load account holder users");
    }

    for (const appUser of (appUserData ?? []) as AppUserRecord[]) {
      appUserById.set(appUser.id, appUser);
    }
  }

  const accounts = buildAccountsWithHolders({
    accounts: accountRows,
    appUserById,
    displayColorByUserId: buildDisplayColorByUserId({
      members: memberRows,
      settings: displaySettingRows,
    }),
    holders: holderRows,
  });
  const holderOptions = buildHolderOptions({
    appUserById,
    members: memberRows,
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        账户
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        管理现金、银行账户、信用卡、电子钱包等账户。
      </Typography>

      {errorMessage ? (
        <Typography color="error" role="alert" sx={{ mt: 3 }}>
          {errorMessage}
        </Typography>
      ) : null}

      <AccountForm
        createAccountAction={createAccount}
        defaultCurrency={currentLedger.baseCurrency}
        holderOptions={holderOptions}
      />
      <AccountList
        accounts={accounts}
        archiveAccountAction={archiveAccount}
        holderOptions={holderOptions}
        updateAccountAction={updateAccount}
      />
    </Paper>
  );
}
