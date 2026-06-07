import { getLedgerContextForApi } from "lib/ledger/api-context";
import { archiveMerchantAliasService } from "server/services/merchants";
import { isUuid } from "utils/formData";
import { rejectInvalidOrigin } from "utils/requestSecurity";

type RouteContext = { params: Promise<{ id: string; aliasId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { aliasId } = await params;
  if (!isUuid(aliasId)) {
    return Response.json({ error: "alias_invalid" }, { status: 400 });
  }

  const result = await archiveMerchantAliasService({
    aliasId,
    ledgerId: ctx.currentLedger.id,
    userId: ctx.userId,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true });
}
