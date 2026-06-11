import { beforeEach, describe, expect, it, vi } from "vitest";

import { merchantErrorCodes } from "server/errors/merchants";
import { createSupabaseMock } from "test/supabaseMock";

import {
  archiveMerchantAliasService,
  archiveMerchantService,
  createMerchantAliasService,
  createMerchantService,
  updateMerchantService,
} from "./merchants";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const merchantId = "00000000-0000-4000-8000-000000001001";
const aliasId = "00000000-0000-4000-8000-000000001002";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("merchant services", () => {
  it("创建商家成功时插入当前账本记录", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{}] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createMerchantService({
        ledgerId,
        name: "LIFE",
        note: "常用超市",
        siteUrl: "https://example.com",
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].table).toBe("merchant");
    expect(supabase.queries[0].calls).toContainEqual({
      args: [
        {
          created_by: userId,
          ledger_id: ledgerId,
          name: "LIFE",
          note: "常用超市",
          sort_order: 0,
          updated_by: userId,
          website_url: "https://example.com",
        },
      ],
      method: "insert",
    });
  });

  it("创建商家数据库错误时返回 create_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: { message: "duplicate merchant" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createMerchantService({
        ledgerId,
        name: "LIFE",
        note: null,
        siteUrl: null,
        userId,
      }),
    ).resolves.toEqual({
      error: merchantErrorCodes.createFailed,
      ok: false,
    });
  });

  it("更新商家成功时只更新当前账本中的未归档商家", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ count: 1 }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateMerchantService({
        ledgerId,
        merchantId,
        name: "ライフ",
        note: null,
        siteUrl: null,
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        {
          args: [
            {
              name: "ライフ",
              note: null,
              updated_by: userId,
              website_url: null,
            },
            { count: "exact" },
          ],
          method: "update",
        },
        { args: ["id", merchantId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
      ]),
    );
  });

  it("更新商家没有命中当前账本记录时返回 update_failed", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ count: 0 }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateMerchantService({
        ledgerId,
        merchantId,
        name: "ライフ",
        note: null,
        siteUrl: null,
        userId,
      }),
    ).resolves.toEqual({
      error: merchantErrorCodes.updateFailed,
      ok: false,
    });
  });

  it("更新商家数据库错误时返回 update_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: { message: "update error" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateMerchantService({
        ledgerId,
        merchantId,
        name: "ライフ",
        note: null,
        siteUrl: null,
        userId,
      }),
    ).resolves.toEqual({
      error: merchantErrorCodes.updateFailed,
      ok: false,
    });
  });

  it("归档商家成功时只归档当前账本中的未归档商家", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ count: 1 }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantService({ ledgerId, merchantId, userId }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        {
          args: [
            expect.objectContaining({
              archived_by: userId,
              is_archived: true,
              updated_by: userId,
            }),
            { count: "exact" },
          ],
          method: "update",
        },
        { args: ["id", merchantId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
      ]),
    );
  });

  it("归档商家没有命中当前账本记录时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ count: 0 }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantService({ ledgerId, merchantId, userId }),
    ).resolves.toEqual({
      error: merchantErrorCodes.archiveFailed,
      ok: false,
    });
  });

  it("归档商家数据库错误时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: { message: "archive error" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantService({ ledgerId, merchantId, userId }),
    ).resolves.toEqual({
      error: merchantErrorCodes.archiveFailed,
      ok: false,
    });
  });

  it("新增别名成功时先确认商家属于当前账本", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: { id: merchantId } }, {}],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createMerchantAliasService({
        alias: "来福",
        ledgerId,
        merchantId,
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        { args: ["id", merchantId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
        { args: [], method: "maybeSingle" },
      ]),
    );
    expect(supabase.queries[1].calls).toContainEqual({
      args: [
        {
          alias: "来福",
          created_by: userId,
          merchant_id: merchantId,
          sort_order: 0,
          updated_by: userId,
        },
      ],
      method: "insert",
    });
  });

  it("新增别名时商家不属于当前账本则返回 merchant_invalid", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ data: null }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createMerchantAliasService({
        alias: "来福",
        ledgerId,
        merchantId,
        userId,
      }),
    ).resolves.toEqual({
      error: merchantErrorCodes.merchantInvalid,
      ok: false,
    });
    expect(supabase.queries).toHaveLength(1);
  });

  it("新增别名数据库错误时返回 alias_create_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: merchantId } },
        { error: { message: "duplicate alias" } },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createMerchantAliasService({
        alias: "来福",
        ledgerId,
        merchantId,
        userId,
      }),
    ).resolves.toEqual({
      error: merchantErrorCodes.aliasCreateFailed,
      ok: false,
    });
  });

  it("归档别名成功时返回所属商家 ID", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: aliasId, merchant_id: merchantId } },
        { data: { id: merchantId } },
        { count: 1 },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantAliasService({ aliasId, ledgerId, userId }),
    ).resolves.toEqual({ merchantId, ok: true });

    expect(supabase.queries[2].calls).toEqual(
      expect.arrayContaining([
        {
          args: [
            expect.objectContaining({
              archived_by: userId,
              is_archived: true,
              updated_by: userId,
            }),
            { count: "exact" },
          ],
          method: "update",
        },
        { args: ["id", aliasId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
      ]),
    );
  });

  it("归档别名不存在时返回 alias_invalid", async () => {
    const supabase = createSupabaseMock({ queryResponses: [{ data: null }] });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantAliasService({ aliasId, ledgerId, userId }),
    ).resolves.toEqual({
      error: merchantErrorCodes.aliasInvalid,
      ok: false,
    });
  });

  it("归档别名所属商家不属于当前账本时返回 alias_invalid", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: aliasId, merchant_id: merchantId } },
        { data: null },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantAliasService({ aliasId, ledgerId, userId }),
    ).resolves.toEqual({
      error: merchantErrorCodes.aliasInvalid,
      ok: false,
    });
  });

  it("归档别名更新失败时返回 alias_archive_failed 和所属商家 ID", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: aliasId, merchant_id: merchantId } },
        { data: { id: merchantId } },
        { count: 0 },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveMerchantAliasService({ aliasId, ledgerId, userId }),
    ).resolves.toEqual({
      error: merchantErrorCodes.aliasArchiveFailed,
      merchantId,
      ok: false,
    });
  });
});
