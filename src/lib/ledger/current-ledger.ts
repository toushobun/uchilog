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

type LedgerRow = {
  id: string;
  name: string;
  base_currency: string;
};

type LedgerMemberRow = {
  // Supabase 的外键 select 在 TypeScript 推断上可能表现为数组。
  // 运行时这里通常是单个 ledger 对象或 null，但为了兼容推断结果，保留数组防御处理。
  ledger: LedgerRow | LedgerRow[] | null;
};

function normalizeLedger(ledger: LedgerRow | LedgerRow[] | null) {
  if (Array.isArray(ledger)) {
    return ledger[0] ?? null;
  }

  return ledger;
}

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

    const { data: memberRows, error: ledgerError } = await supabase
      .from("ledger_member")
      .select("ledger:ledger_id(id, name, base_currency)")
      .eq("user_id", userId)
      .eq("status", "active");

    if (ledgerError) {
      throw new Error(`Failed to load current ledgers: ${ledgerError.message}`);
    }

    const ledgers = ((memberRows ?? []) as LedgerMemberRow[])
      .map((row) => normalizeLedger(row.ledger))
      .filter((ledger): ledger is LedgerRow => ledger !== null)
      .map((ledger) => ({
        id: ledger.id,
        name: ledger.name,
        baseCurrency: ledger.base_currency,
      }));

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
