import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateTransferTransaction } from "server/actions/transactions";

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
const fromAccountId = "00000000-0000-4000-8000-000000000045";
const toAccountId = "00000000-0000-4000-8000-000000000046";
const transactionRecordId = "00000000-0000-4000-8000-000000009001";

function createValidTransferUpdateFormData(
  overrides: Record<string, string> = {},
) {
  const formData = new FormData();

  formData.set("transactionRecordId", transactionRecordId);
  formData.set("type", "transfer");
  formData.set("transactionAt", "2026-06-04T10:30:05");
  formData.set("timeZoneOffsetMinutes", "-540");
  formData.set("accountId", fromAccountId);
  formData.set("transferTargetAccountId", toAccountId);
  formData.set("transferAmount", "5000");
  formData.set("note", "账户转账");

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

describe("updateTransferTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupActionMocks();
  });

  it("成功时调用 update_transfer_transaction RPC 并跳转到发生月份", async () => {
    await expect(
      updateTransferTransaction(createValidTransferUpdateFormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?month=2026-06");

    expect(mocks.rpc).toHaveBeenCalledWith("update_transfer_transaction", {
      p_amount: 5000,
      p_from_account_id: fromAccountId,
      p_ledger_id: ledgerId,
      p_note: "账户转账",
      p_to_account_id: toAccountId,
      p_transaction_at: "2026-06-04T01:30:05.000Z",
      p_transaction_record_id: transactionRecordId,
    });
  });

  it("成功后 revalidate accounts / transactions / edit page", async () => {
    await expect(
      updateTransferTransaction(createValidTransferUpdateFormData()),
    ).rejects.toThrow("NEXT_REDIRECT:");

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/accounts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/transactions");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/transactions/[transactionRecordId]/edit",
      "page",
    );
  });

  it("校验失败时跳回编辑页", async () => {
    await expect(
      updateTransferTransaction(
        createValidTransferUpdateFormData({ transferAmount: "0" }),
      ),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=amount_invalid`,
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("transactionRecordId 非法时跳回列表页", async () => {
    await expect(
      updateTransferTransaction(
        createValidTransferUpdateFormData({ transactionRecordId: "bad-id" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/transactions?error=update_invalid");

    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("RPC 失败时跳回编辑页并带 update_failed", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "update failed" },
    });

    await expect(
      updateTransferTransaction(createValidTransferUpdateFormData()),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/transactions/${transactionRecordId}/edit?error=update_failed`,
    );

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
