import { getLedgerContextForApi } from "lib/ledger/api-context";
import { loadAccountsView } from "server/loaders/accounts";
import { createAccountService } from "server/services/accounts";
import { accountTypeOptions, type AccountType } from "types/accounts";
import { isUuid } from "utils/formData";
import { rejectInvalidOrigin } from "utils/requestSecurity";

const accountTypeValues = accountTypeOptions.map((o) => o.value);

export async function GET() {
  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const view = await loadAccountsView();
  return Response.json(view);
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

  const { name, type, currency, initialBalance = 0, holderUserIds } = body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "name_required" }, { status: 400 });
  }

  if (!accountTypeValues.includes(type)) {
    return Response.json({ error: "type_invalid" }, { status: 400 });
  }

  const currencyUpper =
    typeof currency === "string" ? currency.trim().toUpperCase() : "";
  if (!/^[A-Z]{3}$/.test(currencyUpper)) {
    return Response.json({ error: "currency_invalid" }, { status: 400 });
  }

  if (typeof initialBalance !== "number" || !Number.isFinite(initialBalance)) {
    return Response.json({ error: "initial_balance_invalid" }, { status: 400 });
  }

  if (
    !Array.isArray(holderUserIds) ||
    !holderUserIds.every((id: unknown) => typeof id === "string" && isUuid(id))
  ) {
    return Response.json({ error: "holder_invalid" }, { status: 400 });
  }

  const result = await createAccountService({
    currency: currencyUpper,
    holderUserIds,
    initialBalance,
    ledgerId: ctx.currentLedger.id,
    name: name.trim(),
    type: type as AccountType,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true }, { status: 201 });
}
