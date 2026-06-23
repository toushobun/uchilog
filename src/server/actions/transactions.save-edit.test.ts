import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  convertTransactionType,
  saveEditTransaction,
} from "server/actions/transactions";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentLedgerContext: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("lib/ledger/current-ledger", () => ({
  getCurrentLedgerContext: mocks.getCurrentLedgerContext,
}));

vi.mock("lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const accountId = "00000000-0000-4000-8000-000000000045";
const toAccountId = "00000000-0000-4000-8000-000000000046";
const categoryId = "00000000-0000-4000-8000-000000005072";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";

function createNormalEditFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("sourceType", "expense");
  formData.set("type", "expense");
  formData.set("transactionRecordId", transactionRecordId);
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1200");
  formData.set("merchantId", merchantId);
  formData.set("note", "编辑备注");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function createTransferEditFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("sourceType", "transfer");
  formData.set("type", "transfer");
  formData.set("transactionRecordId", transactionRecordId);
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.set("transferTargetAccountId", toAccountId);
  formData.set("transferAmount", "5000");
  formData.set("note", "转账备注");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function setupActionMocks() {
  mocks.getCurrentLedgerContext.mockResolvedValue({
    currentLedger: {
      id: ledgerId,
      name: "家庭账本",
      base_currency: "JPY",
    },
    userId,
  });

  mocks.createClient.mockResolvedValue({
    rpc: mocks.rpc,
  });

  mocks.rpc.mockResolvedValue({
    data: transactionRecordId,
    error: null,
  });
}

describe("saveEditTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("sourceType = targetType = expense 时调用 update_transaction", async () => {
    await expect(
      saveEditTransaction(createNormalEditFormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "update_transaction",
      expect.objectContaining({ p_type: "expense" }),
    );
  });

  it("sourceType = targetType = transfer 时调用 update_transfer_transaction", async () => {
    await expect(
      saveEditTransaction(createTransferEditFormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "update_transfer_transaction",
      expect.objectContaining({
        p_from_account_id: accountId,
        p_to_account_id: toAccountId,
      }),
    );
  });

  it("expense → income 时走 update_transaction，不走 convert_transaction_type", async () => {
    await expect(
      saveEditTransaction(
        createNormalEditFormData({ sourceType: "expense", type: "income" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "update_transaction",
      expect.objectContaining({ p_type: "income" }),
    );
    expect(mocks.rpc).not.toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.anything(),
    );
  });

  it("expense → transfer 时调用 convert_transaction_type", async () => {
    await expect(
      saveEditTransaction(
        createTransferEditFormData({ sourceType: "expense" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.objectContaining({
        p_target_type: "transfer",
        p_from_account_id: accountId,
        p_to_account_id: toAccountId,
      }),
    );
  });

  it("transfer → expense 时调用 convert_transaction_type", async () => {
    await expect(
      saveEditTransaction(createNormalEditFormData({ sourceType: "transfer" })),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.objectContaining({
        p_target_type: "expense",
        p_account_id: accountId,
      }),
    );
  });

  it("sourceType 为非法值时 redirect 到编辑页并带 update_invalid", async () => {
    await expect(
      saveEditTransaction(createNormalEditFormData({ sourceType: "invalid" })),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=update_invalid`,
    );

    expect(mocks.getCurrentLedgerContext).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("type 字段缺失（targetType 非法）时 redirect 到列表页并带 update_invalid", async () => {
    const formData = new FormData();
    formData.set("sourceType", "expense");

    await expect(saveEditTransaction(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/transactions?error=update_invalid",
    );

    expect(mocks.getCurrentLedgerContext).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("convertTransactionType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("校验失败时 redirect 到编辑页错误路径", async () => {
    await expect(
      convertTransactionType(createNormalEditFormData()),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=update_invalid`,
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("transactionRecordId 缺失时 redirect 到列表页错误路径", async () => {
    const formData = new FormData();
    formData.set("sourceType", "expense");

    await expect(convertTransactionType(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/transactions?error=update_invalid",
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("转换为 transfer 成功时 revalidate 并 redirect", async () => {
    await expect(
      convertTransactionType(
        createTransferEditFormData({ sourceType: "expense" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.objectContaining({
        p_from_account_id: accountId,
        p_ledger_id: ledgerId,
        p_target_type: "transfer",
        p_to_account_id: toAccountId,
        p_transaction_record_id: transactionRecordId,
        p_transfer_amount: 5000,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/accounts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/transactions/[transactionRecordId]/edit",
      "page",
    );
  });

  it("转换为普通交易成功时 revalidate 并 redirect", async () => {
    await expect(
      convertTransactionType(
        createNormalEditFormData({ sourceType: "transfer" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith(
      "convert_transaction_type",
      expect.objectContaining({
        p_account_id: accountId,
        p_items: [{ amount: 1200, categoryId }],
        p_ledger_id: ledgerId,
        p_merchant_id: merchantId,
        p_target_type: "expense",
        p_transaction_record_id: transactionRecordId,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/accounts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/transactions/[transactionRecordId]/edit",
      "page",
    );
  });
});
