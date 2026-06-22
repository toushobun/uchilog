import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactionErrorCodes } from "server/errors/transactions";

const { createClientMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import {
  createTransferTransactionService,
  updateTransferTransactionService,
} from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const transferTargetAccountId = "00000000-0000-4000-8000-000000000042";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";
const transactionAt = "2026-06-04T01:30:05.000Z";

function mockRpcResult(error: unknown = null) {
  rpcMock.mockResolvedValueOnce({ error });
}

describe("transfer transaction service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it("createTransferTransactionService 调用 create_transfer_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      createTransferTransactionService({
        accountId,
        ledgerId,
        note: "转账",
        transactionAt,
        transferAmount: 1200,
        transferTargetAccountId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("create_transfer_transaction", {
      p_amount: 1200,
      p_from_account_id: accountId,
      p_ledger_id: ledgerId,
      p_note: "转账",
      p_to_account_id: transferTargetAccountId,
      p_transaction_at: transactionAt,
    });
  });

  it("createTransferTransactionService 失败时返回 create_failed", async () => {
    mockRpcResult({ message: "failed" });

    await expect(
      createTransferTransactionService({
        accountId,
        ledgerId,
        note: "转账",
        transactionAt,
        transferAmount: 1200,
        transferTargetAccountId,
      }),
    ).resolves.toEqual({
      error: transactionErrorCodes.createFailed,
      ok: false,
    });
  });

  it("updateTransferTransactionService 调用 update_transfer_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      updateTransferTransactionService({
        accountId,
        ledgerId,
        note: "编辑转账",
        transactionAt,
        transactionRecordId,
        transferAmount: 1500,
        transferTargetAccountId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("update_transfer_transaction", {
      p_amount: 1500,
      p_from_account_id: accountId,
      p_ledger_id: ledgerId,
      p_note: "编辑转账",
      p_to_account_id: transferTargetAccountId,
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
    });
  });

  it("updateTransferTransactionService 失败时返回 update_failed", async () => {
    mockRpcResult({ message: "failed" });

    await expect(
      updateTransferTransactionService({
        accountId,
        ledgerId,
        note: "编辑转账",
        transactionAt,
        transactionRecordId,
        transferAmount: 1500,
        transferTargetAccountId,
      }),
    ).resolves.toEqual({
      error: transactionErrorCodes.updateFailed,
      ok: false,
    });
  });
});
