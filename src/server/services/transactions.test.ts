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
  createTransactionService,
  updateTransactionService,
  voidTransactionService,
} from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const categoryId = "00000000-0000-4000-8000-000000000101";
const categoryId2 = "00000000-0000-4000-8000-000000000102";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000002001";
const transactionAt = "2026-06-04T01:30:05.000Z";

function mockRpcResult(error: unknown = null) {
  rpcMock.mockResolvedValueOnce({ error });
}

describe("transactions service", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({ rpc: rpcMock });
  });

  it("createTransactionService 调用 create_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      createTransactionService({
        accountId,
        items: [{ amount: 1200, categoryId }],
        ledgerId,
        merchantId,
        note: "晚餐",
        transactionAt,
        type: "expense",
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("create_transaction", {
      p_account_id: accountId,
      p_items: [{ amount: 1200, categoryId }],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: "晚餐",
      p_transaction_at: transactionAt,
      p_type: "expense",
    });
  });

  it("createTransactionService 支持 income、多明细和空备注", async () => {
    mockRpcResult();

    await expect(
      createTransactionService({
        accountId,
        items: [
          { amount: 1200, categoryId },
          { amount: 500, categoryId: categoryId2 },
        ],
        ledgerId,
        merchantId,
        note: null,
        transactionAt,
        type: "income",
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("create_transaction", {
      p_account_id: accountId,
      p_items: [
        { amount: 1200, categoryId },
        { amount: 500, categoryId: categoryId2 },
      ],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: null,
      p_transaction_at: transactionAt,
      p_type: "income",
    });
  });

  it.each([
    ["RPC 异常", { message: "failed" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])(
    "createTransactionService 失败时返回 create_failed：%s",
    async (_, error) => {
      mockRpcResult(error);

      await expect(
        createTransactionService({
          accountId,
          items: [{ amount: 1200, categoryId }],
          ledgerId,
          merchantId,
          note: "晚餐",
          transactionAt,
          type: "expense",
        }),
      ).resolves.toEqual({
        error: transactionErrorCodes.createFailed,
        ok: false,
      });
    },
  );

  it("updateTransactionService 调用 update_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      updateTransactionService({
        accountId,
        items: [{ amount: 1200, categoryId }],
        ledgerId,
        merchantId,
        note: "编辑后",
        transactionAt,
        transactionRecordId,
        type: "expense",
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("update_transaction", {
      p_account_id: accountId,
      p_items: [{ amount: 1200, categoryId }],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: "编辑后",
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
      p_type: "expense",
    });
  });

  it("updateTransactionService 支持 income、多明细和空备注", async () => {
    mockRpcResult();

    await expect(
      updateTransactionService({
        accountId,
        items: [
          { amount: 1200, categoryId },
          { amount: 500, categoryId: categoryId2 },
        ],
        ledgerId,
        merchantId,
        note: null,
        transactionAt,
        transactionRecordId,
        type: "income",
      }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("update_transaction", {
      p_account_id: accountId,
      p_items: [
        { amount: 1200, categoryId },
        { amount: 500, categoryId: categoryId2 },
      ],
      p_ledger_id: ledgerId,
      p_merchant_id: merchantId,
      p_note: null,
      p_transaction_at: transactionAt,
      p_transaction_record_id: transactionRecordId,
      p_type: "income",
    });
  });

  it.each([
    ["RPC 不存在", { message: "update_transaction missing" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])(
    "updateTransactionService 失败时返回 update_failed：%s",
    async (_, error) => {
      mockRpcResult(error);

      await expect(
        updateTransactionService({
          accountId,
          items: [{ amount: 1200, categoryId }],
          ledgerId,
          merchantId,
          note: "编辑后",
          transactionAt,
          transactionRecordId,
          type: "expense",
        }),
      ).resolves.toEqual({
        error: transactionErrorCodes.updateFailed,
        ok: false,
      });
    },
  );

  it("updateTransactionService 失败时不做 create + void 兜底", async () => {
    mockRpcResult({ message: "update_transaction missing" });

    await updateTransactionService({
      accountId,
      items: [{ amount: 1200, categoryId }],
      ledgerId,
      merchantId,
      note: "编辑后",
      transactionAt,
      transactionRecordId,
      type: "expense",
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
  });

  it("voidTransactionService 调用 void_transaction RPC", async () => {
    mockRpcResult();

    await expect(
      voidTransactionService({ ledgerId, transactionRecordId }),
    ).resolves.toEqual({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("void_transaction", {
      p_ledger_id: ledgerId,
      p_transaction_record_id: transactionRecordId,
    });
  });

  it.each([
    ["RPC 异常", { message: "failed" }],
    ["权限拒绝", { code: "42501" }],
    ["业务拒绝", { code: "P0001" }],
  ])("voidTransactionService 失败时返回 void_failed：%s", async (_, error) => {
    mockRpcResult(error);

    await expect(
      voidTransactionService({ ledgerId, transactionRecordId }),
    ).resolves.toEqual({
      error: transactionErrorCodes.voidFailed,
      ok: false,
    });
  });
});
