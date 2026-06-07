import { createClient } from "lib/supabase/server";

export type ApiLedgerContext = {
  currentLedger: { id: string; name: string; baseCurrency: string };
  userId: string;
};

type ApiContextOk = { ok: true } & ApiLedgerContext;
type ApiContextError = { ok: false; status: 401 | 403; message: string };
type ApiContextResult = ApiContextOk | ApiContextError;

// 与 getCurrentLedgerContext 不同，认证失败时不会 redirect，而是返回错误状态供 API 路由使用。
export async function getLedgerContextForApi(): Promise<ApiContextResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return { ok: false, status: 401, message: "未登录" };
  }

  const userId = data.claims.sub;

  if (typeof userId !== "string" || userId.length === 0) {
    return { ok: false, status: 401, message: "未登录" };
  }

  const { data: memberRows, error: ledgerError } = await supabase
    .from("ledger_member")
    .select("ledger:ledger_id(id, name, base_currency)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (ledgerError) {
    return { ok: false, status: 403, message: "无法获取账本信息" };
  }

  type LedgerRow = { id: string; name: string; base_currency: string };
  type MemberRow = { ledger: LedgerRow | LedgerRow[] | null };

  const ledger = ((memberRows ?? []) as MemberRow[])
    .map((row) => {
      const l = row.ledger;
      return Array.isArray(l) ? (l[0] ?? null) : l;
    })
    .filter((l): l is LedgerRow => l !== null)
    .map((l) => ({ id: l.id, name: l.name, baseCurrency: l.base_currency }))[0];

  if (!ledger) {
    return { ok: false, status: 403, message: "尚未设置账本" };
  }

  return { ok: true, currentLedger: ledger, userId };
}
