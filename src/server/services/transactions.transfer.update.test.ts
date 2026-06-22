import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactionErrorCodes } from "server/errors/transactions";

const { createClientMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { updateTransferTransactionService } from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const fromAccountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";
const transactionAt = "2026-06-04T01:30:05.000Z";

function mockRpcResult(error: unknown = null) {
  rpcMock.mockResolvedValueOnce({ error });
}

describe("updateTransferTransactionService", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it("成功时调用正确的 RPC 和参数", async () => {
    mockRpcResult();

    await expect(
      updateTransferTransactionService({
        accountId: fromAccountId,
        ledgerId,
        note: "转账备注",
        transactionAt,
        transactionRecordId,
        transferAmount: 5000,
        transferTargetAccountId: toAccountId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("update_transfer_transaction", {
      p_amount: 5000,
      p_from_account_id: fromAccountId,
      p_ledger_id: ledgerId,
      p_note: "转账备注",
      p_to_account_id: toAccountId,
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
    });
  });

  it.each([
    ["RPC 异常", { message: "failed" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])("RPC 失败时返回 update_failed：%s", async (_, error) => {
    mockRpcResult(error);

    await expect(
      updateTransferTransactionService({
        accountId: fromAccountId,
        ledgerId,
        note: null,
        transactionAt,
        transactionRecordId,
        transferAmount: 5000,
        transferTargetAccountId: toAccountId,
      }),
    ).resolves.toEqual({
      error: transactionErrorCodes.updateFailed,
      ok: false,
    });
  });
});
