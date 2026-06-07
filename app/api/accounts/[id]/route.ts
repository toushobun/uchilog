import { getLedgerContextForApi } from "lib/ledger/api-context";
import {
  archiveAccountService,
  updateAccountService,
} from "server/services/accounts";
import { accountTypeOptions, type AccountType } from "types/accounts";
import { isUuid } from "utils/formData";
import { rejectInvalidOrigin } from "utils/requestSecurity";

type RouteContext = { params: Promise<{ id: string }> };

const accountTypeValues = accountTypeOptions.map((o) => o.value);

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { id: accountId } = await params;
  if (!isUuid(accountId)) {
    return Response.json({ error: "account_invalid" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const { name, type, currency, holderUserIds } = body;

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

  if (
    !Array.isArray(holderUserIds) ||
    !holderUserIds.every((id: unknown) => typeof id === "string" && isUuid(id))
  ) {
    return Response.json({ error: "holder_invalid" }, { status: 400 });
  }

  const result = await updateAccountService({
    accountId,
    currency: currencyUpper,
    holderUserIds,
    ledgerId: ctx.currentLedger.id,
    name: name.trim(),
    type: type as AccountType,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { id: accountId } = await params;
  if (!isUuid(accountId)) {
    return Response.json({ error: "account_invalid" }, { status: 400 });
  }

  const result = await archiveAccountService({
    accountId,
    ledgerId: ctx.currentLedger.id,
    userId: ctx.userId,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true });
}
