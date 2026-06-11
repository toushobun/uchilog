import { beforeEach, describe, expect, it, vi } from "vitest";

import { accountErrorCodes } from "server/errors/accounts";
import { createSupabaseMock } from "test/supabaseMock";

import {
  archiveAccountService,
  createAccountService,
  updateAccountService,
} from "./accounts";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const accountId = "00000000-0000-4000-8000-000000000045";
const holderUserId = "00000000-0000-4000-8000-000000000046";

const createParams = {
  currency: "JPY",
  holderUserIds: [holderUserId],
  initialBalance: 1000,
  ledgerId,
  name: "现金",
  type: "cash" as const,
};

const updateParams = {
  accountId,
  currency: "JPY",
  holderUserIds: [holderUserId],
  ledgerId,
  name: "日常现金",
  type: "cash" as const,
};

const archiveParams = {
  accountId,
  ledgerId,
  userId,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("account services", () => {
  it("创建账户成功时调用账户持有人 RPC", async () => {
    const supabase = createSupabaseMock();
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(createAccountService(createParams)).resolves.toEqual({
      ok: true,
    });

    expect(supabase.rpc).toHaveBeenCalledWith("create_account_with_holders", {
      p_currency: "JPY",
      p_holder_user_ids: [holderUserId],
      p_initial_balance: 1000,
      p_ledger_id: ledgerId,
      p_name: "现金",
      p_type: "cash",
    });
  });

  it("创建账户 RPC 失败时返回 create_failed", async () => {
    const supabase = createSupabaseMock({
      rpcResponse: { error: { message: "duplicate account" } },
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(createAccountService(createParams)).resolves.toEqual({
      error: accountErrorCodes.createFailed,
      ok: false,
    });
  });

  it("更新账户成功时调用账户持有人 RPC", async () => {
    const supabase = createSupabaseMock();
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(updateAccountService(updateParams)).resolves.toEqual({
      ok: true,
    });

    expect(supabase.rpc).toHaveBeenCalledWith("update_account_with_holders", {
      p_account_id: accountId,
      p_currency: "JPY",
      p_holder_user_ids: [holderUserId],
      p_ledger_id: ledgerId,
      p_name: "日常现金",
      p_type: "cash",
    });
  });

  it("更新账户 RPC 失败时返回 update_failed", async () => {
    const supabase = createSupabaseMock({
      rpcResponse: { error: { message: "ledger mismatch" } },
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(updateAccountService(updateParams)).resolves.toEqual({
      error: accountErrorCodes.updateFailed,
      ok: false,
    });
  });

  it("归档账户成功时只更新当前账本中的未归档账户", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ count: 1 }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(archiveAccountService(archiveParams)).resolves.toEqual({
      ok: true,
    });

    expect(supabase.queries[0].table).toBe("account");
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
        { args: ["id", accountId], method: "eq" },
        { args: ["ledger_id", ledgerId], method: "eq" },
        { args: ["is_archived", false], method: "eq" },
      ]),
    );
  });

  it("归档账户没有命中当前账本记录时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ count: 0 }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(archiveAccountService(archiveParams)).resolves.toEqual({
      error: accountErrorCodes.archiveFailed,
      ok: false,
    });
  });

  it("归档账户数据库错误时返回 archive_failed", async () => {
    const supabase = createSupabaseMock({
      queryResponses: [{ count: 1, error: { message: "update failed" } }],
    });
    mocks.createClient.mockResolvedValue(supabase.client);

    await expect(archiveAccountService(archiveParams)).resolves.toEqual({
      error: accountErrorCodes.archiveFailed,
      ok: false,
    });
  });
});
