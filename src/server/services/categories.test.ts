import { beforeEach, describe, expect, it, vi } from "vitest";

import { categoryErrorCodes } from "server/errors/categories";
import { createSupabaseMock } from "test/supabaseMock";

import {
  archiveCategoryService,
  createCategoryService,
  updateCategoryService,
} from "./categories";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const categoryId = "00000000-0000-4000-8000-000000000101";
const parentId = "00000000-0000-4000-8000-000000000102";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("category services", () => {
  it("创建大分类成功时计算下一个排序值并插入", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: [{ sort_order: 20 }] }, {}],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createCategoryService({
        ledgerId,
        name: "食费",
        parentId: null,
        type: "expense",
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["type", "expense"], method: "eq" },
        { args: ["parent_id", null], method: "is" },
      ]),
    );
    expect(supabase.queries[1].calls).toContainEqual({
      args: [
        {
          created_by: userId,
          ledger_id: ledgerId,
          name: "食费",
          parent_id: null,
          sort_order: 30,
          type: "expense",
          updated_by: userId,
        },
      ],
      method: "insert",
    });
  });

  it("创建小分类成功时先确认父分类属于当前账本", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: parentId } },
        { data: [{ sort_order: 10 }] },
        {},
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createCategoryService({
        ledgerId,
        name: "超市",
        parentId,
        type: "expense",
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        { args: ["id", parentId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["type", "expense"], method: "eq" },
        { args: ["parent_id", null], method: "is" },
        { args: [], method: "maybeSingle" },
      ]),
    );
    expect(supabase.queries[2].calls).toContainEqual({
      args: [
        expect.objectContaining({
          name: "超市",
          parent_id: parentId,
          sort_order: 20,
        }),
      ],
      method: "insert",
    });
  });

  it("父分类不属于当前账本时返回 parent_invalid", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: null }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createCategoryService({
        ledgerId,
        name: "超市",
        parentId,
        type: "expense",
        userId,
      }),
    ).resolves.toEqual({
      error: categoryErrorCodes.parentInvalid,
      ok: false,
    });
    expect(supabase.queries).toHaveLength(1);
  });

  it("读取排序值失败时返回 create_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: { message: "select failed" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createCategoryService({
        ledgerId,
        name: "食费",
        parentId: null,
        type: "expense",
        userId,
      }),
    ).resolves.toEqual({
      error: categoryErrorCodes.createFailed,
      ok: false,
    });
  });

  it("插入分类失败时返回 create_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: [] },
        { error: { message: "duplicate category" } },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      createCategoryService({
        ledgerId,
        name: "食费",
        parentId: null,
        type: "expense",
        userId,
      }),
    ).resolves.toEqual({
      error: categoryErrorCodes.createFailed,
      ok: false,
    });
  });

  it("更新分类成功时只更新当前账本中的未归档分类", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ count: 1 }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateCategoryService({
        categoryId,
        ledgerId,
        name: "外食",
        userId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[0].calls).toEqual(
      expect.arrayContaining([
        {
          args: [{ name: "外食", updated_by: userId }, { count: "exact" }],
          method: "update",
        },
        { args: ["id", categoryId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
      ]),
    );
  });

  it("更新分类没有命中当前账本记录时返回 update_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ count: 0 }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateCategoryService({
        categoryId,
        ledgerId,
        name: "外食",
        userId,
      }),
    ).resolves.toEqual({
      error: categoryErrorCodes.updateFailed,
      ok: false,
    });
  });

  it("更新分类数据库错误时返回 update_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ error: { message: "update error" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      updateCategoryService({
        categoryId,
        ledgerId,
        name: "外食",
        userId,
      }),
    ).resolves.toEqual({
      error: categoryErrorCodes.updateFailed,
      ok: false,
    });
  });

  it("归档大分类成功时同时归档其子分类", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: categoryId, parent_id: null } },
        { count: 2 },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveCategoryService({ categoryId, ledgerId, userId }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[1].calls).toEqual(
      expect.arrayContaining([
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
        {
          args: [`id.eq.${categoryId},parent_id.eq.${categoryId}`],
          method: "or",
        },
      ]),
    );
  });

  it("归档小分类成功时只归档自身", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: categoryId, parent_id: parentId } },
        { count: 1 },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveCategoryService({ categoryId, ledgerId, userId }),
    ).resolves.toEqual({ ok: true });

    expect(supabase.queries[1].calls).toContainEqual({
      args: ["id", categoryId],
      method: "eq",
    });
  });

  it("归档分类不属于当前账本时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ data: null }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveCategoryService({ categoryId, ledgerId, userId }),
    ).resolves.toEqual({
      error: categoryErrorCodes.archiveFailed,
      ok: false,
    });
  });

  it("归档分类时 update 命中 0 行时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [
        { data: { id: categoryId, parent_id: null } },
        { count: 0 },
      ],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(
      archiveCategoryService({ categoryId, ledgerId, userId }),
    ).resolves.toEqual({
      error: categoryErrorCodes.archiveFailed,
      ok: false,
    });
  });
});
