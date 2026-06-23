import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactionErrorCodes } from "server/errors/transactions";

const { createClientMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { convertTransactionTypeService } from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const toAccountId = "00000000-0000-4000-8000-000000000042";
const categoryId = "00000000-0000-4000-8000-000000000101";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";
const transactionAt = "2026-06-04T01:30:05.000Z";

function mockRpcResult(error: unknown = null) {
  rpcMock.mockResolvedValueOnce({ error });
}

describe("convertTransactionTypeService", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it("targetType=transfer 时使用 from/to account 参数调用 RPC", async () => {
    mockRpcResult();

    await expect(
      convertTransactionTypeService({
        targetType: "transfer",
        accountId,
        ledgerId,
        note: "转账备注",
        transactionAt,
        transactionRecordId,
        transferAmount: 5000,
        transferTargetAccountId: toAccountId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("convert_transaction_type", {
      p_account_id: null,
      p_from_account_id: accountId,
      p_items: null,
      p_ledger_id: ledgerId,
      p_merchant_id: null,
      p_note: "转账备注",
      p_tag_names: [],
      p_target_type: "transfer",
      p_to_account_id: toAccountId,
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
      p_transfer_amount: 5000,
    });
  });

  it("targetType=expense 时使用 account_id / items / merchant 参数调用 RPC", async () => {
    mockRpcResult();

    await expect(
      convertTransactionTypeService({
        targetType: "expense",
        accountId,
        ledgerId,
        items: [{ amount: 1200, categoryId }],
        merchantId,
        note: null,
        tagNames: ["日常"],
        transactionAt,
        transactionRecordId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("convert_transaction_type", {
      p_account_id: accountId,
      p_from_account_id: null,
      p_items: [{ amount: 1200, categoryId }],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: null,
      p_tag_names: ["日常"],
      p_target_type: "expense",
      p_to_account_id: null,
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
      p_transfer_amount: null,
    });
  });

  it("targetType=income 时正确传递 income 类型参数", async () => {
    mockRpcResult();

    await expect(
      convertTransactionTypeService({
        targetType: "income",
        accountId,
        ledgerId,
        items: [{ amount: 3000, categoryId }],
        merchantId,
        note: "收入转换",
        tagNames: [],
        transactionAt,
        transactionRecordId,
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.objectContaining({
        p_target_type: "income",
        p_account_id: accountId,
        p_from_account_id: null,
        p_transfer_amount: null,
      }),
    );
  });

  it.each([
    ["RPC 异常", { message: "failed" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])(
    "convertTransactionTypeService 失败时返回 update_failed：%s",
    async (_, error) => {
      mockRpcResult(error);

      await expect(
        convertTransactionTypeService({
          targetType: "expense",
          accountId,
          ledgerId,
          items: [{ amount: 1200, categoryId }],
          merchantId,
          note: null,
          tagNames: [],
          transactionAt,
          transactionRecordId,
        }),
      ).resolves.toEqual({
        error: transactionErrorCodes.updateFailed,
        ok: false,
      });
    },
  );
});
