import type { QueryData } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "lib/supabase/server";
import { routePaths } from "config/paths";

export type CurrentLedger = {
  id: string;
  name: string;
  baseCurrency: string;
};

export type CurrentLedgerContext = {
  userId: string;
  email: string;
  ledgers: CurrentLedger[];
  currentLedger: CurrentLedger | null;
};

export const getCurrentLedgerContext = cache(
  async (): Promise<CurrentLedgerContext> => {
    // cache() 的缓存范围是单次 server request。
    // redirect() 抛出的控制流即使在同一请求内被复用，也只会在该请求内重新触发跳转，不会跨请求污染登录状态。
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      redirect(routePaths.login);
    }

    const userId = data.claims.sub;

    if (typeof userId !== "string" || userId.length === 0) {
      redirect(routePaths.login);
    }

    const email =
      typeof data.claims.email === "string" ? data.claims.email : "登录用户";

    const memberQuery = supabase
      .from("ledger_member")
      .select("ledger_id")
      .eq("user_id", userId)
      .eq("status", "active");
    type LedgerMemberRows = QueryData<typeof memberQuery>;

    const { data: memberData, error: memberError } = await memberQuery;

    if (memberError) {
      console.error("Failed to load current ledger members.", memberError);
      throw new Error(
        `Failed to load current ledger members: ${memberError.message}`,
      );
    }

    const memberRows: LedgerMemberRows = memberData ?? [];
    const ledgerIds = memberRows
      .map((row) => row.ledger_id)
      .filter(
        (ledgerId): ledgerId is string =>
          typeof ledgerId === "string" && ledgerId.length > 0,
      );

    if (ledgerIds.length === 0) {
      return {
        userId,
        email,
        ledgers: [],
        currentLedger: null,
      };
    }

    const ledgerQuery = supabase
      .from("ledger")
      .select("id, name, base_currency")
      .in("id", ledgerIds);
    type LedgerRows = QueryData<typeof ledgerQuery>;

    const { data: ledgerData, error: ledgerError } = await ledgerQuery;

    if (ledgerError) {
      console.error("Failed to load current ledgers.", ledgerError);
      throw new Error(`Failed to load current ledgers: ${ledgerError.message}`);
    }

    const ledgerRows: LedgerRows = ledgerData ?? [];
    const ledgerById = new Map(
      ledgerRows.map((ledger) => [
        ledger.id,
        {
          id: ledger.id,
          name: ledger.name,
          baseCurrency: ledger.base_currency,
        },
      ]),
    );

    const ledgers = ledgerIds
      .map((ledgerId) => ledgerById.get(ledgerId))
      .filter((ledger): ledger is CurrentLedger => ledger !== undefined);

    return {
      userId,
      email,
      ledgers,
      currentLedger: ledgers[0] ?? null,
    };
  },
);

export async function getCurrentLedgerOrRedirect() {
  const context = await getCurrentLedgerContext();

  if (!context.currentLedger) {
    redirect(routePaths.ledgerSetup);
  }

  return context.currentLedger;
}
