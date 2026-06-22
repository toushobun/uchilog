import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactionErrorCodes } from "server/errors/transactions";

const { createClientMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { createTransferTransactionService } from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const fromAccountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const transactionAt = "2026-06-04T01:30:05.000Z";

function mockRpcResult(error: unknown = null) {
  rpcMock.mockResolvedValueOnce({ error });
}

describe("transfer transactions service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it("createTransferTransactionService 调用 create_transfer_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      createTransferTransactionService({
        accountId: fromAccountId,
        ledgerId,
        note: "账户转账",
        transactionAt,
        transferAmount: 1200,
        transferTargetAccountId: toAccountId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("create_transfer_transaction", {
      p_amount: 1200,
      p_from_account_id: fromAccountId,
      p_ledger_id: ledgerId,
      p_note: "账户转账",
      p_to_account_id: toAccountId,
      p_transaction_at: transactionAt,
    });
  });

  it.each([
    ["RPC 异常", { message: "failed" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])(
    "createTransferTransactionService 失败时返回 create_failed：%s",
    async (_, error) => {
      mockRpcResult(error);

      await expect(
        createTransferTransactionService({
          accountId: fromAccountId,
          ledgerId,
          note: null,
          transactionAt,
          transferAmount: 1200,
          transferTargetAccountId: toAccountId,
        }),
      ).resolves.toEqual({
        error: transactionErrorCodes.createFailed,
        ok: false,
      });
    },
  );
});
