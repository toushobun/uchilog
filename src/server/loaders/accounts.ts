"use server";

import { getCurrentLedgerOrRedirect } from "lib/ledger/current-ledger";
import { createClient } from "lib/supabase/server";

import type {
  AccountHolderOption,
  AccountHolderRecord,
  AccountRow,
  AppUserRecord,
  LedgerMemberDisplaySettingRecord,
  LedgerMemberRecord,
} from "types/accounts";
import {
  buildAccountsWithHolders,
  buildDisplayColorByUserId,
  buildHolderOptions,
} from "utils/accounts";

export type AccountsView = {
  accounts: AccountRow[];
  baseCurrency: string;
  holderOptions: AccountHolderOption[];
  ledgerName: string;
};

export async function loadAccountsView(): Promise<AccountsView> {
  const currentLedger = await getCurrentLedgerOrRedirect();
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

  if (displaySettingError) {
    throw new Error("Failed to load ledger member display settings");
  }

  if (holderError) {
    throw new Error("Failed to load account holders");
  }

  const memberRows = (memberData ?? []) as LedgerMemberRecord[];
  const displaySettingRows = (displaySettingData ??
    []) as LedgerMemberDisplaySettingRecord[];
  const holderRows = (holderData ?? []) as AccountHolderRecord[];
  const userIds = [
    ...new Set([
      ...memberRows.map((member) => member.user_id),
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

  return {
    accounts: buildAccountsWithHolders({
      accounts: accountRows,
      appUserById,
      displayColorByUserId: buildDisplayColorByUserId({
        members: memberRows,
        settings: displaySettingRows,
      }),
      holders: holderRows,
    }),
    baseCurrency: currentLedger.baseCurrency,
    holderOptions: buildHolderOptions({
      appUserById,
      members: memberRows,
    }),
    ledgerName: currentLedger.name,
  };
}
