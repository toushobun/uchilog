import { getLedgerContextForApi } from "lib/ledger/api-context";
import { loadMerchantsView } from "server/loaders/merchants";
import { createMerchantService } from "server/services/merchants";
import { parseWebsiteUrl } from "utils/merchants";
import { rejectInvalidOrigin } from "utils/requestSecurity";

export async function GET(request: Request) {
  const ctx = await getLedgerContextForApi();
  if (!ctx.ok) {
    return Response.json({ error: ctx.message }, { status: ctx.status });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? "";
  const view = await loadMerchantsView(keyword);
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

  const { name, websiteUrl, note } = body;

  if (typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "name_required" }, { status: 400 });
  }
  if (name.trim().length > 100) {
    return Response.json({ error: "name_too_long" }, { status: 400 });
  }

  const parsedUrl = parseWebsiteUrl(websiteUrl);
  if (parsedUrl === undefined) {
    return Response.json({ error: "website_url_invalid" }, { status: 400 });
  }

  const noteStr = note === undefined || note === null ? null : String(note);
  if (noteStr !== null && noteStr.length > 1000) {
    return Response.json({ error: "note_too_long" }, { status: 400 });
  }

  const result = await createMerchantService({
    ledgerId: ctx.currentLedger.id,
    name: name.trim(),
    note: noteStr,
    userId: ctx.userId,
    websiteUrl: parsedUrl,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true }, { status: 201 });
}
