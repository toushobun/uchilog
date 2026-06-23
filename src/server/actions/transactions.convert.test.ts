import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { convertTransactionType } from "server/actions/transactions";

const ledgerId = "00000000-0000-4000-8000-000000000032";
const userId = "00000000-0000-4000-8000-000000000031";
const accountId = "00000000-0000-4000-8000-000000000045";
const toAccountId = "00000000-0000-4000-8000-000000000046";
const categoryId = "00000000-0000-4000-8000-000000005072";
const merchantId = "00000000-0000-4000-8000-000000001001";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";

function createConvertToTransferFormData(
  overrides: Record<string, string> = {},
) {
  const formData = new FormData();

  formData.set("sourceType", "expense");
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

function createConvertToNormalFormData(
  overrides: Record<string, string> = {},
) {
  const formData = new FormData();

  formData.set("sourceType", "transfer");
  formData.set("type", "expense");
  formData.set("transactionRecordId", transactionRecordId);
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", accountId);
  formData.append("itemCategoryId", categoryId);
  formData.append("itemAmount", "1200");
  formData.set("merchantId", merchantId);
  formData.set("note", "普通交易备注");

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

  mocks.rpc.mockResolvedValue({ error: null });
}

describe("convertTransactionType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("校验失败时 redirect 到编辑页错误路径", async () => {
    await expect(
      convertTransactionType(
        createConvertToNormalFormData({ sourceType: "expense" }),
      ),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=update_invalid`,
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("转换为 transfer 成功时 revalidate 并 redirect", async () => {
    await expect(
      convertTransactionType(createConvertToTransferFormData()),
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
      convertTransactionType(createConvertToNormalFormData()),
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
