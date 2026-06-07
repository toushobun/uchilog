import { getLedgerContextForApi } from "lib/ledger/api-context";
import { loadTransactionListPage } from "server/loaders/transactions";
import { createTransactionService } from "server/services/transactions";
import { rejectInvalidOrigin } from "utils/requestSecurity";
import { validateTransactionBody } from "utils/transactionValidation";

export async function GET(request: Request) {
  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? "0") || 0);
  const page = await loadTransactionListPage(offset);
  return Response.json(page);
}

export async function POST(request: Request) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const validation = validateTransactionBody(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const result = await createTransactionService({
    ...validation.value,
    ledgerId: ctx.currentLedger.id,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true }, { status: 201 });
}
