import { getLedgerContextForApi } from "lib/ledger/api-context";
import { createClient } from "lib/supabase/server";
import { createMerchantAliasService } from "server/services/merchants";
import { isUuid } from "utils/formData";
import { rejectInvalidOrigin } from "utils/requestSecurity";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { id: merchantId } = await params;
  if (!isUuid(merchantId)) {
    return Response.json({ error: "merchant_invalid" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { alias } = body;
  if (typeof alias !== "string" || alias.trim().length === 0) {
    return Response.json({ error: "alias_required" }, { status: 400 });
  }
  if (alias.trim().length > 100) {
    return Response.json({ error: "alias_too_long" }, { status: 400 });
  }

  // 确认商家属于当前账本
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merchant")
    .select("id")
    .eq("id", merchantId)
    .eq("ledger_id", ctx.currentLedger.id)
    .eq("is_archived", false)
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: "merchant_invalid" }, { status: 400 });
  }

  const result = await createMerchantAliasService({
    alias: alias.trim(),
    merchantId,
    userId: ctx.userId,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true }, { status: 201 });
}
