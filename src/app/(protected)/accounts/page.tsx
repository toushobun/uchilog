import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

import { AccountForm } from "accounts/AccountForm";
import { AccountList } from "accounts/AccountList";

import { archiveAccount, createAccount, updateAccount } from "./actions";
import type { AccountHolderRole, AccountHolderRow, AccountRow } from "./types";

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
};

const errorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  archive_failed: "账户归档失败。",
  create_failed: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  update_failed: "账户更新失败。请确认账户名称是否重复，或稍后重试。",
  currency_invalid: "货币必须是 3 位大写字母，例如 JPY。",
  initial_balance_invalid: "初始余额必须是数字。",
  name_required: "请输入账户名称。",
  type_invalid: "账户类型不正确。",
};

function buildAccountsWithHolders({
  accounts,
  appUsers,
  holders,
}: {
  accounts: Omit<AccountRow, "holders">[];
  appUsers: AppUserRecord[];
  holders: AccountHolderRecord[];
}) {
  const appUserById = new Map(appUsers.map((user) => [user.id, user]));
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
  let appUserRows: AppUserRecord[] = [];

  if (accountIds.length > 0) {
    const { data: holderData, error: holderError } = await supabase
      .from("account_holder")
      .select("id, account_id, user_id, role, share_ratio")
      .eq("ledger_id", currentLedger.id)
      .in("account_id", accountIds);

    if (holderError) {
      throw new Error("Failed to load account holders");
    }

    holderRows = (holderData ?? []) as AccountHolderRecord[];

    const userIds = [...new Set(holderRows.map((holder) => holder.user_id))];

    if (userIds.length > 0) {
      const { data: appUserData, error: appUserError } = await supabase
        .from("app_user")
        .select("id, display_name, email")
        .in("id", userIds);

      if (appUserError) {
        throw new Error("Failed to load account holder users");
      }

      appUserRows = (appUserData ?? []) as AppUserRecord[];
    }
  }

  const accounts = buildAccountsWithHolders({
    accounts: accountRows,
    appUsers: appUserRows,
    holders: holderRows,
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
      />
      <AccountList
        accounts={accounts}
        archiveAccountAction={archiveAccount}
        updateAccountAction={updateAccount}
      />
    </Paper>
  );
}
