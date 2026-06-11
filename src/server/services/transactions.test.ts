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
  voidTransactionService,
} from "./transactions";

const ledgerId = "00000000-0000-4000-8000-000000000001";
const accountId = "00000000-0000-4000-8000-000000000041";
const categoryId = "00000000-0000-4000-8000-000000000101";
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

  describe("createTransactionService", () => {
    it("支出交易创建成功时调用 create_transaction RPC，并传递余额扣减所需参数", async () => {
      mockRpcResult();

      const result = await createTransactionService({
        accountId,
        items: [{ amount: 1200, categoryId }],
        ledgerId,
        merchantId,
        note: "晚餐",
        transactionAt,
        type: "expense",
      });

      expect(result).toEqual({ ok: true });
      expect(createClientMock).toHaveBeenCalledTimes(1);
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

    it("收入交易创建成功时传递 income 类型，让 RPC 执行余额增加路径", async () => {
      mockRpcResult();

      const result = await createTransactionService({
        accountId,
        items: [{ amount: 250000, categoryId }],
        ledgerId,
        merchantId: null,
        note: "工资",
        transactionAt,
        type: "income",
      });

      expect(result).toEqual({ ok: true });
      expect(rpcMock).toHaveBeenCalledWith("create_transaction", {
        p_account_id: accountId,
        p_items: [{ amount: 250000, categoryId }],
        p_ledger_id: ledgerId,
        p_merchant_id: null,
        p_note: "工资",
        p_transaction_at: transactionAt,
        p_type: "income",
      });
    });

    it("允许商家、备注为空的交易进入 RPC", async () => {
      mockRpcResult();

      const result = await createTransactionService({
        accountId,
        items: [{ amount: 500, categoryId }],
        ledgerId,
        merchantId: null,
        note: null,
        transactionAt,
        type: "expense",
      });

      expect(result).toEqual({ ok: true });
      expect(rpcMock).toHaveBeenCalledWith("create_transaction", {
        p_account_id: accountId,
        p_items: [{ amount: 500, categoryId }],
        p_ledger_id: ledgerId,
        p_merchant_id: null,
        p_note: null,
        p_transaction_at: transactionAt,
        p_type: "expense",
      });
    });

    it("多条明细创建成功时传递 items 给 create_transaction RPC", async () => {
      mockRpcResult();
      const secondCategoryId = "00000000-0000-4000-8000-000000000102";

      const result = await createTransactionService({
        accountId,
        items: [
          { amount: 286, categoryId },
          { amount: 45, categoryId: secondCategoryId },
        ],
        ledgerId,
        merchantId,
        note: "超市",
        transactionAt,
        type: "expense",
      });

      expect(result).toEqual({ ok: true });
      expect(rpcMock).toHaveBeenCalledWith("create_transaction", {
        p_account_id: accountId,
        p_items: [
          { amount: 286, categoryId },
          { amount: 45, categoryId: secondCategoryId },
        ],
        p_ledger_id: ledgerId,
        p_merchant_id: merchantId,
        p_note: "超市",
        p_transaction_at: transactionAt,
        p_type: "expense",
      });
    });

    it.each([
      "ledger 不匹配",
      "account 不属于当前 ledger",
      "category 不属于当前 ledger",
      "merchant 不属于当前 ledger",
      "archived account",
      "archived category",
      "archived merchant",
      "invalid 参数",
      "账户余额联动失败",
    ])("RPC 拒绝创建交易：%s 时返回 create_failed", async (message) => {
      mockRpcResult({ message });

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
    });
  });

  describe("voidTransactionService", () => {
    it("active transaction void 成功时调用 void_transaction RPC", async () => {
      mockRpcResult();

      const result = await voidTransactionService({
        ledgerId,
        transactionRecordId,
      });

      expect(result).toEqual({ ok: true });
      expect(createClientMock).toHaveBeenCalledTimes(1);
      expect(rpcMock).toHaveBeenCalledWith("void_transaction", {
        p_ledger_id: ledgerId,
        p_transaction_record_id: transactionRecordId,
      });
    });

    it.each([
      "transactionRecordId 非 UUID",
      "transaction 不属于当前 ledger",
      "transaction 已经 void",
      "transaction archived",
      "余额回滚失败",
      "RPC 执行失败",
    ])("RPC 拒绝 void 交易：%s 时返回 void_failed", async (message) => {
      mockRpcResult({ message });

      await expect(
        voidTransactionService({
          ledgerId,
          transactionRecordId,
        }),
      ).resolves.toEqual({
        error: transactionErrorCodes.voidFailed,
        ok: false,
      });
    });
  });
});
